---
title: 用 xterm.js 实现一个简易的 web-terminal ！
date: 2021-01-27 10:25:41
tags: web-technology
---

![web-terminal](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7c70fc3e2eb84c3087844900b1651d51~tplv-k3u1fbpfcp-watermark.image)

# 前言

大家新年好呀~ 因为工作比较忙，有一段时间没更新了（其实就是懒），一直没想好写啥，直到最近工作中遇到了个需要内嵌 **网页终端（web-terminal）** 的需求，踩了不少坑，终于整明白了大概，想着写篇文章回馈下社区，于是乎说干就干，走起~

# xterm.js 初探

知道需要做 **web-terminal** ，第一件事先网上调研一下具体需要的技术，最后发现 **xterm.js** 为大多数 **web-terminal** 的解决方案，大名鼎鼎的 [vscode](https://code.visualstudio.com/) 也在用，看来可靠性还是有所保证的。
于是乎，我兴高采烈的敲进[官网](https://xtermjs.org/)找 **demo**，瞅了一眼，好家伙看起来挺简单啊，只需要安装一下，初始化实例就行了，如下：

```javascript
npm install xterm
```

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="node_modules/xterm/css/xterm.css" />
    <script src="node_modules/xterm/lib/xterm.js"></script>
  </head>
  <body>
    <div id="terminal"></div>
    <script>
      var term = new Terminal();
      term.open(document.getElementById("terminal"));
      term.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");
    </script>
  </body>
</html>
```

因为我们项目的基于 `React` 的，所以我准备用 `create-react-app` 写个 **demo** 试试，一顿操作之后，把官网的例子拷进 **demo** 里，然后运行一下，看看效果。
随后页面出来了终端的样式，如下：
正准备输写字符看看效果，好家伙。。居然无法输入，我一度怀疑是我 **demo** 复制错了，仔细比对，发现确实没错啊？？
然后我找了找文档，发现输入还需要调用 **api** 才行，感情官网的例子居然还不能直接运行的，也是第一次见。
调整了下代码

```diff
  term.open(document.getElementById("terminal"));
  term.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");
+ term.onData((val) => {
+     term.write(val);
+   });
```

输入终于可以了，但是新的问题又来了，一删除就报错

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b3a228a0adc847fe9d0784fafebe3f5f~tplv-k3u1fbpfcp-watermark.image)

而且一回车就光标回到最开始了，这。。我不禁陷入了沉思，再次回到文档找寻，发现了文档对 `onData` 的描述

> contains real string data with any valid Unicode codepoint, thus the payload should be treated as **UTF-16/UCS-2**. For OS interaction this data should be converted to **UTF-8** bytes (automatically done by `node-pty`). If you need legacy encoding support, see below.

原来 `onData` 返回的都是 **UTF-16/UCS-2** 编码的，要让系统认识得输出成 **UTF-8** 编码，怪不得我直接输入会有问题，还得自己转一下编码...这可难为我了，难道那么多按键都要做一遍解析？

幸好官方已经提出了解决方案，那就是用 `node-pty` 进行自动解析。使用方式也很简单,官网有如下代码

```
pty.onData(recv => terminal.write(recv));
terminal.onData(send => pty.write(send));
```

大意就是让 `onData` 返回的 **UTF-16/UCS-2** 字符串用 `node-pty` 解析成系统可读的 **UTF-8** 编码的字符串来完成输入，很明显，我们需要创建他们之间的联系，把 `xterm.js` 当浏览器的图形渲染界面， `node-pty` 当服务端监听输入的并转码的工具，通过 **websocket** 来关联起两边的关系，看上去可行！

# 使用 node-pty 解析键盘输入信号

既然知道 `node-pty` 可以解析，我们首先需要安装它，根据官网的描述，不同系统安装 `node-pty` 需要有不同的准备工作，这也可以理解，因为不同系统会有不同的差异。

## Linux/Ubuntu

```
sudo apt install -y make python build-essential
Node.JS 10+
```

## macOS

```
Xcode is needed to compile the sources, this can be installed from the App Store.
```

## Windows

```
npm install --global --production windows-build-tools
Windows SDK - only the "Desktop C++ Apps" components are needed to be installed
Node.JS 10+
```

安装完之后，创建我们服务端的文件 **server.js**，果汁用 `express` `express-ws` 来搭建 **node** 服务 和启用 **websocket** 服务。

```javascript
const express = require("express");
const expressWs = require("express-ws");
const app = express();
expressWs(app);
app.listen(4000, "127.0.0.1");
```

然后加入 `node-pty` 的初始代码。

```javascript
const express = require("express");
const expressWs = require("express-ws");
const app = express();
expressWs(app);
const pty = require("node-pty");
const os = require("os");
const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
const term = pty.spawn(shell, ["--login"], {
  name: "xterm-color",
  cols: 80,
  rows: 24,
  cwd: process.env.HOME,
  env: process.env,
});
app.ws("/socket", (ws, req) => {
  term.on("data", function (data) {
    ws.send(data);
  });
  ws.on("message", (data) => {
    term.write(data);
  });
  ws.on("close", function () {
    term.kill();
  });
});
```

实际场景中，还会有多个终端共同工作的场景，这样我们在服务器启动就直接初始化显然无法满足，怎么办呢？
经过一番思索.. 有了！果汁的想法是客户端初始化终端实例的时候，就初始化服务端 `pty` 实例，不同的终端初始化不同的 `pty` 实例，通过 `pid` 来区分，这样如果有拓展多终端的场景也可以满足。

客户端方面通过发送一个初始化的请求到服务端，服务端初始化完 `pty` 实例，返回当前实例的 `pid` ，然后客户端和服务端每次进行 **websocket** 交互的时候都带上 `pid` ，服务端通过 `pid` 去拿对应的 `pty` 实例，返回解析后的值给客户端，这样就实现了多终端的场景！

改造我们之前的代码

```javascript
...
const termMap = new Map(); //存储 pty 实例，通过 pid 映射
function nodeEnvBind() {
  //绑定当前系统 node 环境
  const term = pty.spawn(shell, ["--login"], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env,
  });
  termMap.set(term.pid, term);
  return term;
}
//服务端初始化
app.post("/terminal", (req, res) => {
  const term = nodeEnvBind(req);
  res.send(term.pid.toString());
  res.end();
});
app.ws("/socket/:pid", (ws, req) => {
  const pid = parseInt(req.params.pid);
  const term = termMap.get(pid);
  term.on("data", function (data) {
    ws.send(data);
  });
  ws.on("message", (data) => {
    term.write(data);
  });
  ws.on("close", function () {
    term.kill();
    termMap.delete(pid);
  });
});
```

# 客户端连接 websocket

服务端大功告成！接下来我们开始编写客户端代码，客户端需要创建 **websocket** 连接。

```javascript
const socketURL = "ws://127.0.0.1:4000/socket/";
const ws = new WebSocket(socketURL);
```

光这样还不够，我们还需要获取服务端 `pty` 实例的 `pid`，来当做连接的唯一标识符,这就简单了，直接通过接口获取就行。

```javascript
import axios from "axios";
...
//初始化当前系统环境，返回终端的 pid，标识当前终端的唯一性
const initSysEnv = async (term: Terminal) =>
  await axios
    .post("http://127.0.0.1:4000/terminal")
     .then((res) => res.data)
     .catch((err) => {
       throw new Error(err);
    });
const pid = await initSysEnv(term),
ws = new WebSocket(socketURL + pid);
```

`xterm.js` 本身提供了拓展包的能力，这里我们用到它的一个扩展包 `xterm-addon-attach`，它可以帮我们自动和**websocket**进行交互，省去我们自己写了。

> 注意：xterm-addon-attach 需要 xterm.js v4+

```javascript
import { AttachAddon } from "xterm-addon-attach";
...
attachAddon = new AttachAddon(ws);
term.loadAddon(attachAddon);
```

这样客户端代码也完成啦~
让我们启动下看看。
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9424f0ce10c84615ac613883977f65b0~tplv-k3u1fbpfcp-watermark.image)

居然跨域了。。好吧，那我们再在服务端加入防跨域代码。

```javascript
// //解决跨域问题
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});
```

重启服务器看效果~

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8ef1f003b740497ba0fc9b15a6d52af1~tplv-k3u1fbpfcp-watermark.image)
可看到我们已经成功运行起来了，果汁也通过 `web-terminal` 成功远程登陆了家里的 **树莓派**，看上去体验还不错哈

# 总结

从代码量上可以看出，实现一个 **web-terminal** 并不是特别困难，主要还是思路。想要源码的小伙伴，我已经把代码传到 **github** 上了，[传送门](https://github.com/RedJue/web-terminal) 在这里，路过点个**赞**👍 就是对我最大的支持啦，那我们下期再见~
