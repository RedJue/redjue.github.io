---
title: 还不会写Webpack loader？没事，带你从0到1实现简易的css-loader和style-loader！
date: 2020-11-30 11:53:59
tags: webpack
---
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4d920ac103a447d1a0702138f66ca3b3~tplv-k3u1fbpfcp-watermark.image)
# 前言
作为前端每天都在打交道的 `webpack` ，学精是很有必要的，尤其是负责文件解析的 `webpack-loader`（以下简称loader），它作为 `webpack` 的加载器成了打包必不可少的一环。本文将从实现层面洞察 `loader` 的实现原理，相信看完本文，你自己也可以写一个属于自己的 `loader` ，废话不多说，让我们开始吧！
# 准备工作
### 1. 我们需要个能调试 `loader` 的 `webpack` 环境，控制台执行以下指令：

```shell
npm init
npm install webpack webpack-cli webpack-dev-server babel-loader @babel/core -D
```
### 2. 创建 `webpack.config.js` 、打包入口 `main.js`和我们需要加载的css文件 `color.css`
```shell
touch webpack.config.js
touch main.js
touch color.css
```
### 3. 写入基本的打包配置
```javascript
const path = require('path');
module.exports = {
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'output.bundle.js'
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 9000
    }
};
```
### 4. 创建我们的 `loader` 文件夹和 `loader` 文件
```shell
mkdir my-loader
cd my-loader
touch css-loader.js
touch style-loader.js
```
### 5. 由于 `style-loader` 是为了作用于**浏览器端**，我们需要通过页面来看效果，创建**html**文件，再对`webpack配置`进行修改
```shell
npm install html-webpack-plugin -D
touch index.html
```
```diff
const path = require('path');
+ const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'output.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader'
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 9000
    },
+   plugins: [new HtmlWebpackPlugin({ template: './index.html' })]
};
```
### 6. 创建 `loader` 配置
```diff
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'output.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader'
            },
+           {
+               test: /\.css$/,
+               use: [
+                   {
+                        loader: path.resolve('./my-loader/style-loader')
+                   },
+                   {
+                        loader: path.resolve('./my-loader/css-loader')
+                   }
+               ]
+           }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 9000
    },
    plugins: [new HtmlWebpackPlugin({ template: './index.html' })]
};
```
#### 至此我们的环境搭建已经完成，不出意外的话目录应该如下所示
```shell
├── color.css
├── index.html
├── main.js
├── my-loader
|  ├── css-loader.js
|  └── style-loader.js
├── package-lock.json
├── package.json
└── webpack.config.js
```
# 实现 css-loader
`css-loader` 作为解析css文件的主要 `loader`，主要目的是为了解析通过 `import/requrie` 引入的 `css` 样式文件，根据 [webpack官网说明](https://www.webpackjs.com/contribute/writing-a-loader/) ，所有 `loader` 都是导出为一个函数的 `node` 模块。
```javascript
//最简单的一个loader，不处理任何文件，直接返回资源
module.exports = function (source) {
   return source;
};
```
现在让我们将它变成一个能处理 `css` 文件的 `loader` ！
### 准备工作

- 首先在 `color.css` 写入我们的样式
```css
body {
    background-color: #20232a;
}
span {
    font-size: 40px;
    font-weight: bold;
    margin: 0 16px;
    text-transform: capitalize;
}
.react {
    color: #61dafb;
}
.vue {
    color: #4fc08d;
}
.angular {
    color: #f4597b;
}
```
- `main.js` 引入我们的`css`文件
```javascript
import style from './color.css'; //如果css-loader工作，style将是类名的keyMap
window.onload = () => {
    const body = document.body;
    const frameworks = ['react', 'vue', 'angular'];
    frameworks.forEach((item) => {
        const span = document.createElement('span');
        span.innerText = item;
        span.setAttribute('class', style[item]);
        body.appendChild(span);
    });
};
```
### 编写loader
- 获取 `css文本`，这一步 `webpack` 已经自动帮我们处理了，通过匹配 `.css` 文件后缀，自动获取 `css文本` ，也就是 `source` 参数
```text
"body {\n    background-color: #20232a;\n}\nspan {\n    font-size: 40px;\n    font-weight: bold;\n    margin: 0 16px;\n    text-transform: capitalize;\n}\n.react {\n    color: #61dafb;\n}\n.vue {\n    color: #4fc08d;\n}\n.angular {\n    color: #f4597b;\n}\n"
```
- 解析 `css文本`，通过正则提取其中的 `css类选择器`（注：因本文只是简易实现，所以只考虑单类名的情况）
```javascript
module.exports = function (source) {
   // source
   const reg = /(?<=\.)(.*?)(?={)/g; //获取字符串所有类名的正则
   const classKeyMap = Object.fromEntries(source.match(reg).map((str) => [str.trim(), str.trim()])); //取出字符串中原始 css类名
   return source;
};
```
得到如下 `classKeyMap` 
```javascript
{
  react: "react",
  vue: "vue",
  angular: "angular",
}
```
- 根据 [loader](https://www.webpackjs.com/api/loaders/) 的返回定义， `loader` 返回的结果应该是 `String` 或者 `Buffer`（被转换为一个 string），所以我们输出的结果应该转成 `string` 的形式，需要输出的有两个东西，一个处理过的 `css` 的源文件，另一个是类名的 `映射Map` （为了让js文件读取到css），为了标识这两个变量，用特殊的 `key` 来标注，如下所示
```javascript
module.exports = function (source) {
   // source
   const reg = /(?<=\.)(.*?)(?={)/g; //获取字符串所有类名的正则
   const classKeyMap = Object.fromEntries(source.match(reg).map((str) => [str.trim(), str.trim()])); //取出字符串中原始 css类名
   return `/**__CSS_SOURCE__${source}*//**__CSS_CLASSKEYMAP__${JSON.stringify(classKeyMap)}*/`;
```
至此一个简易的 `css-loader` 就完成了！
### 添加 css-module
- 我们现在再尝试给他加上 `css-module` 的功能，新增 `webpack` 配置
```diff
  {
      test: /\.css$/,
      use: [
          {
              loader: path.resolve('./my-loader/style-loader')
          },
          {
              loader: path.resolve('./my-loader/css-loader'),
+             options: {
+                 module: true
+             }
          }
      ]
  }
```
为了解析 `loader` 的配置，官方提供了读取配置的 `loader-utils` 和 校验配置的 `schema-utils`，我们先安装他们
```shell
npm install loader-utils schema-utils -D
```
改造一下我们之前的 `loader`
```javascript
const getOptions = require('loader-utils').getOptions;
const validateOptions = require('schema-utils').validate;
const schema = {
    type: 'object',
    properties: {
        module: {
            type: 'boolean'
        }
    }
};
module.exports = function (source) {
    const options = getOptions(this); // 获取 loader options
    validateOptions(schema, options, 'css-loader'); //根据 schema 校验options参数类型是否正确
    const reg = /(?<=\.)(.*?)(?={)/g; //获取字符串所有类名的正则
    const classKeyMap = Object.fromEntries(source.match(reg).map((str) => [str.trim(), str.trim()])); //取出字符串中原始 css类名
    return `/**__CSS_SOURCE__${source}*//**__CSS_CLASSKEYMAP__${JSON.stringify(classKeyMap)}*/`;
};
```
`schema-utils` 保证我们参数的可靠性，如果不符合 `schema` 的类型预期，`webpack` 会抛出异常
```javascript
Module build failed (from ./my-loader/css-loader.js):
ValidationError: Invalid configuration object. Object has been initialized using a configuration object that does not match the API schema.
 - configuration.module should be a boolean.
    at validate (/Users/redjue/Desktop/Webpack Loader/node_modules/schema-utils/dist/validate.js:104:11)
    at Object.module.exports (/Users/redjue/Desktop/Webpack Loader/my-loader/css-loader.js:19:5)
 @ ./main.js 1:0-32 9:31-36
```
- 为 `css` 类名加上 `scope`
```javascript
const getOptions = require('loader-utils').getOptions;
const validateOptions = require('schema-utils').validate;
const schema = {
    type: 'object',
    properties: {
        module: {
            type: 'boolean'
        }
    }
};
// hash 生成函数
function hash() {
    const s4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return s4() + s4();
}

module.exports = function (source) {
    const options = getOptions(this);
    validateOptions(schema, options, 'css-loader'); //根据 schema 校验options参数类型是否正确
    const reg = /(?<=\.)(.*?)(?={)/g; //获取字符串所有类名的正则
    const classKeyMap = Object.fromEntries(source.match(reg).map((str) => [str.trim(), str.trim()])); //取出字符串中原始 css类名
    if (options.module) {
        //css-module
        const cssHashMap = new Map();
        source = source.replace(reg, (result) => {
            const key = result.trim();
            const cssHash = hash();
            cssHashMap.set(key, cssHash);
            return `${key}-${cssHash}`;
        });
        Object.entries(classKeyMap).forEach((item) => {
            classKeyMap[item[0]] = `${item[1]}-${cssHashMap.get(item[0])}`;
        });
    }
    return `/**__CSS_SOURCE__${source}*//**__CSS_classKeyMap__${JSON.stringify(classKeyMap)}*/`;
};
```
至此支持 `css-module` 的 `css-loader` 就编写完成了！接下来让我们编写 `style-loader` ，让样式展现到页面上
# 实现 style-loader

`style-loader` 负责把 `css样式` 放进dom中，实现相对比 `css-loader` 容易些
```javascript
module.exports = function (source) {
    const cssSource = source.match(/(?<=__CSS_SOURCE__)((.|\s)*?)(?=\*\/)/g); //获取 css 资源字符串
    const classKeyMap = source.match(/(?<=__CSS_classKeyMap__)((.|\s)*?)(?=\*\/)/g); // 获取 css 类名Map
    let script = `var style = document.createElement('style');   
    style.innerHTML = ${JSON.stringify(cssSource)};
    document.head.appendChild(style);
  `;
    if (classKeyMap !== null) {
        script += `module.exports = ${classKeyMap}`;
    }
    return script;
};
```
有了 `css-loader` 解析的数据，`style-loader` 做的事情很简单，负责把样式放到页面上，以及对 `classkeyMap` 的导出。
# 使用 loader
完成了 `css-loader` 和 `style-loader`的编写，让我们看看他实际运作的效果！

由于默认会安装 `webpack5.x` 的版本，`dev-server` 的指令已经被 `webpack serve` 指令所替代，所以我们执行以下命令启动服务
```shell
redjue@fengji:Webpack Loader ⍉ ➜ webpack serve
Debugger attached.
ℹ ｢wds｣: Project is running at http://localhost:9000/
ℹ ｢wds｣: webpack output is served from undefined
ℹ ｢wds｣: Content not from webpack is served from /Users/redjue/Desktop/Webpack Loader/dist
```
打开浏览器访问 [http://localhost:9000/](http://localhost:9000/) 如果看到以下效果，说明我们的 `style-loader ` 生效了！
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9955f955882146a1b7f015df01a49582~tplv-k3u1fbpfcp-watermark.image)

让我们再看看 `css-module` 有没有生效，打开控制台
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6512358d597e40c994a24b85854443de~tplv-k3u1fbpfcp-watermark.image)

很好也生效了，至此我们成功运行了自己编写的 `loader` 
# 写在最后
当然官方的`css-loader` 和 `style-loader`还要复杂的多，本文主要是为了让大家了解怎么去编写一个 `loader`，码字不易，点个赞再走呗~
### 欢迎关注笔者的公粽号 【前端可真酷】，不定期分享原创好文，让我们一起玩最 cool 的前端！
![公众号](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/190aec329eaf4cafbb55b5369a786133~tplv-k3u1fbpfcp-watermark.image)