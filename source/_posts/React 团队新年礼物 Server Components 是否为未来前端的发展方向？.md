---
title: React 团队新年礼物 Server Components 是否为未来前端的发展方向？
date: 2021-01-27 10:30:27
categories: 分享
tags: react
---

![react-server-component](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b0ae119affff4fd1a3834c5aefc281fc~tplv-k3u1fbpfcp-watermark.image)

# 前言

2020 年 12 月 22 日，新年到来之际，**React** 官方推特发表了一个令人激动的消息

> As 2020 comes to an end we wanted to share a special Holiday Update on our research into zero-bundle-size React Server Components.

`React Server Components`、`zero-bundle-size` 这些词让我意识到事情并不简单，而且可能是一种全新的尝试，带着强烈的好奇心，我看完了官方的[演示视频](https://www.youtube.com/watch?v=TQQPAU21ZUw)（需要科学上网），视频的演示真的让我激动！跟我理想的前端架构越来越接近了，接下来让笔者带你们了解下这全新的 `React Server Components`!<!-- more -->

# 什么是 Server Components？

可能有很多人会疑惑，我们不是已经有 **服务端渲染（Server Side Render）** 的方案了吗？为啥还要搞个服务端组件的概念，或者说服务端组件解决了哪些痛点是 **SSR** 所不具备的，有以下几点

1. 传统的**服务端渲染**，返回的是 **HTML** 的代码片段，而且只在页面一开始加载的时候返回，首次加载结束之后，所有组件其实还是在客户端执行渲染，和没有 **SSR** 的 **APP** 是完全一样的，有点像传统的服务端渲染模板，比如 `PHP`、`JSP`等。
2. 传统的**服务端渲染**，所有组件最终还是在客户端的打包体积里，这点和客户端渲染的 **APP** 无异。
3. 传统的**服务端渲染**首次页面加载的时候就需要去服务器下载对应组件依赖的 **js** ，因为没那些依赖，组件没法跑起来。

这些问题不能说是 **服务端渲染** 的问题，而是目前 **APP** 都有的通病，无论 **客户端渲染** 还是 **服务端渲染** 都免不了这些问题。

`Server Components` 为我们解决这些问题提供了一些思路，所谓服务端组件即这组件只存在于服务端，而不会进入客户端，怎么理解这个呢？
我们来看一个[官方 demo](https://github.com/reactjs/server-components-demo)里服务端组件的例子

```javascript
// NoteList.server.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { fetch } from "react-fetch";

import { db } from "./db.server";
import SidebarNote from "./SidebarNote";

export default function NoteList({ searchText }) {
  // const notes = fetch('http://localhost:4000/notes').json();

  // WARNING: This is for demo purposes only.
  // We don't encourage this in real apps. There are far safer ways to access
  // data in a real application!
  const notes = db.query(
    `select * from notes where title ilike $1 order by id desc`,
    ["%" + searchText + "%"]
  ).rows;

  // Now let's see how the Suspense boundary above lets us not block on this.
  // fetch('http://localhost:4000/sleep/3000');

  return notes.length > 0 ? (
    <ul className="notes-list">
      {notes.map((note) => (
        <li key={note.id}>
          <SidebarNote note={note} />
        </li>
      ))}
    </ul>
  ) : (
    <div className="notes-empty">
      {searchText
        ? `Couldn't find any notes titled "${searchText}".`
        : "No notes created yet!"}{" "}
    </div>
  );
}
```

从代码里可以看到，服务端组件可以直接从数据库拿数据填充到组件里，也可以通过接口获取数据，因为存在于服务端，所以具备了服务端的一些优势，但是它也是一个组件，按理应该被下载到客户端进行渲染像 **SSR** 那样返回 **HTML** 片段，事实真的这样吗？我们来启动项目看看！

> 因为是服务端组件的项目，免不了需要安装数据库，官方 demo 用的是 pg 数据库，需要配置一下环境才能启动

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d0b23c42e324ad2aa70464ccdb685b0~tplv-k3u1fbpfcp-watermark.image)

可以看到最后渲染的并不是单纯的 **HTML** 片段，而是一段序列化的组件信息，打开控制台找到现在客户端的资源可以发现，我们的服务端组件并没有被打包到客户端

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20a351abaacf4a659e9cee73806aac33~tplv-k3u1fbpfcp-watermark.image)

被打包的只有客户端组件。

这就是服务端组件，本身并不占用客户端的资源，只在需要的时候返回到客户端进行渲染，这个渲染是完全独立的，**React** 在服务端保留了一个服务端的 `React component tree` 可以保持和客户端的 `React component tree` 一致，保持状态的统一，这就能做到完全的局部渲染，但这个局部渲染的 **js** 本身不是在客户端的，而是放在了服务器上，这就是为什么说 `Server Components` 是 `zero-bundle-size` 的，因为本身就不会被下载到客户端，只在服务端执行组件逻辑。

# Server Components 有哪些特性？

## 完全 zero-bundle-size

之前说过，服务端组件是放在服务端不会被下载到客户端，所以不占用打包大小，还有一点是第三方依赖包的大小也被减为 0，不会被发送到客户端

```javascript
// NoteWithMarkdown.js
// NOTE: *before* Server Components

import marked from 'marked'; // 35.9K (11.2K gzipped)
import sanitizeHtml from 'sanitize-html'; // 206K (63.3K gzipped)

function NoteWithMarkdown({text}) {
  const html = sanitizeHtml(marked(text));
  return (/* render */);
}
```

如果变成服务端组件之后

```javascript
// NoteWithMarkdown.server.js - Server Component === zero bundle size

import marked from "marked"; // zero bundle size
import sanitizeHtml from "sanitize-html"; // zero bundle size

function NoteWithMarkdown({ text }) {
  // same as before
}
```

## 与后端环境完美融合

因为服务端组件在服务端运行，所以具备了后端能力，比如读写文件

```javascript
// Note.server.js - Server Component
import fs from "react-fs";

function Note({ id }) {
  const note = JSON.parse(fs.readFile(`${id}.json`));
  return <NoteWithMarkdown note={note} />;
}
```

或是直接从数据库拿数据

```javascript
// Note.server.js - Server Component
import db from "db.server";

function Note({ id }) {
  const note = db.notes.get(id);
  return <NoteWithMarkdown note={note} />;
}
```

调用接口也因为和后端更近而更快的响应。

## 自动 Code Splitting

**Code Splitting** 是一个日常开发提升应用性能很好的方式，可以做到组件的异步加载，正常 React 应用如下

```javascript
// PhotoRenderer.js
// NOTE: *before* Server Components

import React from "react";

// one of these will start loading *when rendered on the client*:
const OldPhotoRenderer = React.lazy(() => import("./OldPhotoRenderer.js"));
const NewPhotoRenderer = React.lazy(() => import("./NewPhotoRenderer.js"));

function Photo(props) {
  // Switch on feature flags, logged in/out, type of content, etc:
  if (FeatureFlags.useNewPhotoRenderer) {
    return <NewPhotoRenderer {...props} />;
  } else {
    return <OldPhotoRenderer {...props} />;
  }
}
```

这是常规的写法，但这种写法会带来一些问题：

1. 开发人员必须记住，用 `React.lazy` 和动态 `import` 来替换常规的导入语句，提高了心智负担。
2. 这种方法加长了应用程序开始加载所选组件的时间，抵消了异步加载更少代码所带来的好处。

针对第一个问题，服务端组件会默认将所有引入的客户端组件当做需要代码分割的组件，而不需要写额外的代码。

针对第二个问题，因为在服务端，所以会让客户端更早的下载分割的异步组件。

服务端组件写法：

```javascript
// PhotoRenderer.server.js - Server Component

import React from "react";

// one of these will start loading *once rendered and streamed to the client*:
import OldPhotoRenderer from "./OldPhotoRenderer.client.js";
import NewPhotoRenderer from "./NewPhotoRenderer.client.js";

function Photo(props) {
  // Switch on feature flags, logged in/out, type of content, etc:
  if (FeatureFlags.useNewPhotoRenderer) {
    return <NewPhotoRenderer {...props} />;
  } else {
    return <OldPhotoRenderer {...props} />;
  }
}
```

## 减少接口调用频率

普通的客户端组件需要通过频繁的调用接口来填充组件内数据，因为接口的延迟，会影响 **UI** 的渲染，同时有时候调用接口其实只需要用到其中的一部分数据，但接口会去全量查询数据库，出现了数据的冗余。

服务端组件将获取数据的逻辑搬到了服务端，直接操作数据库或调用接口，能实现更好的页面性能，也减少接口调用的频率。

```javascript
// Note.server.js - Server Component

function Note(props) {
  // NOTE: loads *during* render, w low-latency data access on the server
  const note = db.notes.get(props.id);
  if (note == null) {
    // handle missing note
  }
  return (/* render note here... */);
}
```

## 减少函数抽象带来的成本

**React** 是函数式编程而不是模板式（比如 vue），这就导致组件的页面结构并不像模板式编程一样清晰明确，过多的抽象代码会让开发者维护困难，服务端组件避免了这些抽象带来的不利元素，包裹多个组件的服务端组件最终只会返回单个元素给客户端，比如下面这个例子，最终 **React** 只会返回 **div** 给客户端渲染

```javascript
// Note.server.js
// ...imports...

function Note({id}) {
  const note = db.notes.get(id);
  return <NoteWithMarkdown note={note} />;
}

// NoteWithMarkdown.server.js
// ...imports...

function NoteWithMarkdown({note}) {
  const html = sanitizeHtml(marked(note.text));
  return <div ... />;
}

// client sees:
<div>
  <!-- markdown output here -->
</div>
```

# Server Components 所带来的的问题

说了那么多 `Server Components` 的好处，`Server Components` 真的是目前比较合理的解决方案吗？

我还是持否定态度的。

所谓一切事情都有两面性，带来益处的同时肯定也会有一定的弊端，就看弊端和带来的益处孰轻孰重了。

## 增加了服务器的压力和运维成本

`Server Components` 带来的一个明显的弊端，增加了服务器的压力和运维成本，这个用户体量上来之后会越发明显，把一定的计算力放到了服务端进行，是不能不考虑的因素。

## 服务端组件不支持状态管理

因为每个服务端组件只会请求一次数据，概念上说他是没有状态管理的，也没法使用生命周期，也没法使用 `React hooks`。

## 服务端组件不能使用 Dom Api

服务端渲染的组件确实没法使用浏览器的 `Api`。

## 客户端组件不能共享服务端组件的逻辑

渲染环境的差异，导致客户端组件是不能共享服务端组件的逻辑的。但是官方还提出了共享组件的概念，共享组件没有`.client`、`.server`的后缀，共享组件里的逻辑原则上需要兼容客户端和服务端组件的运行条件。

## 提高了心智负担

加入了服务端组件之后，使得我们写代码的时候得时时刻刻考虑该组件是放到服务端渲染还是客户端渲染，并不纯粹了，写服务端组件的时候也需要考虑哪些 `API` 可以用，哪些不能用，降低了开发效率。

# 总结

目前 `Server Components` 还是在 **research** 阶段，距离能投入到生产环境应该还要一段时间，服务端组件概念的提出，为未来前端的发展方向多了一种选择，前端发展总是在不断的试错之中前进的，让我们一起期待吧~

路过点个赞 👍 就是对笔者最大的鼓励，也可以关注笔者公众号【前端可真酷】第一时间获取精彩原创好文！那么我们下次再见~
