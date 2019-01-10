---
title: webpack的配置解析
date: 2017-08-31 22:12:40
tags: webpack
---
![webpack的配置解析](webpack的配置解析/webpack.jpg)

webpack的出现真正意义上使前端的工程化构建趋于完美，本篇将详细的讲讲webpack常用的配置选项。

<!-- more -->

## <mblue>webpack，browserify和RequireJs</mblue>
<mred>webpack</mred>算是近段时间来最火的一个模块打包工具了，要说及它的优点就不得不谈谈它的前辈<mred>browserify</mred>和<mred>RequireJs</mred>。
### <mblack>RequireJs</mblack>
当时有一个开发人员一直头疼的问题：js有方法或属性的依赖问题，所以引入js的顺序必须严格按照依赖的先后顺序来，这为我们多次加载js造成了困难，业务复杂的情况下使维护变得非常困难。为了解决这个问题，<mred>RequireJs</mred>出现了，它使模块的加载变得井井有条。

<mred>RequireJs</mred>是基于<mred>AMD</mred>规范的，也就是需要引入依赖的写法，如果写过ng1的童鞋应该对这种写法很熟悉，类似这样：
```javascript
//module.js 定义模块
define(function () {
    return function (a, b) {
        console.log(a + b);
    }
});
//引入
require(['module'], function (module) {
    module(1 + 2); // 3
});
```
写惯了<mred>CommonJS</mred>写法的我，再回头看看这种写法，确实觉得累赘，但当时确实是一种很具有开创新的思想。<mred>RequireJs</mred>的**require**方法是一个异步方法，它可以保证在对应依赖都加载完成的情况下才执行回调函数，这使维护起来异常简便，你也不用担心加载顺序的问题，你只要关心依赖之间的关系就可以了。但这样还有个问题就是每个模块还是要引入对应的js，这样会发起多次http请求，对网页性能的影响很大，还好<mred>RequireJs</mred>提供了一个把各个模块整合到一个文件的工具，解决了多次加载文件的问题。

这个时候的<mred>RequireJs</mred>已经有<mred>webpack</mred>的雏形了。
### <mblack>browserify</mblack>
随着<mred>node</mred>的发展，前端的工程化被不断的推上日程，其中有一个最主要的问题是工程化道路上所必须面对的：目前的浏览器还是只能支持**ES5**的语法，而<mred>node</mred>环境下模块都是用<mred>CommonJS</mred>规范构建的，怎么才能把<mred>CommonJS</mred>的语法编译成浏览器认识的**ES5**语法呢？在这探索的路上，<mred>browserify</mred>就应此出现。

<mred>browserify</mred>做了两件事：

1. 对用<mred>CommonJS</mred>规范构建的<mred>node</mred>模块进行转换和包装。
2. 对<mred>node</mred>的大多数包进行了适配，使它们能更好的在浏览器里运行。

保证了<mred>node</mred>模块能在浏览器顺畅运行，踏出了前端工程化的重要一步。
### <mblack>webpack</mblack>
<mred>webpack</mred>正是吸取了前辈的特点，将他们整合到一起，形成了一套比较完善的打包构建系统，它既有完善的打包流程，又能让<mred>node</mred>模块完美的兼容各类浏览器。

随着<mred>webpack</mred>的不断发展，生态圈越来越大，渐渐成了主流的打包构建工具，前端自动化，工程化已经不再只是设想了，<mred>webpack</mred>已经帮我们实现了！

## <mblue>webpack详解</mblue>
### <mblack>webpack常见配置讲解</mblack>
既然<mred>webpack</mred>那么好用，我们肯定要好好看看它是怎么配置的，写出适合自己项目的配置，大大提高开发效率！

>注意!本人用的是<mred>webpack@2.x</mred>版本，可能会与<mred>webpack@1.x</mred>版本的有些写法会不一样，下面会提到


[<mlink>webpack官网</mlink>](https://doc.webpack-china.org/configuration) 已经把配置选项讲解的很详细了（现在文档也有中文版的翻译了，很贴心），太细节的就不深入了，我会把一些常见的配置项拿出来，说说他们的用途和一些可能会遇到的坑，先贴一张我个人项目中部分的<mred>webpack</mred>的配置：
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
// 项目根路径
const ROOT_PATH = path.resolve(__dirname);
// 项目源码路径
const SRC_PATH = ROOT_PATH + '/src';
// 产出路径
const DIST_PATH = ROOT_PATH + '/dist';
// node_modules
const NODE_MODULES_PATH = ROOT_PATH + '/node_modules';
const __DEV__ = process.env.NODE_ENV !== 'production';
module.exports = {
    devtool: 'source-map',
    context: ROOT_PATH,
    entry: {
        libs: [
            'react',
            'react-dom',
            'redux',
            'react-redux',
            'react-router',
            'react-router-redux'
        ],
        app: [SRC_PATH + '/app.jsx']
    },
    output: {
        path: DIST_PATH,
        filename: __DEV__ ? 'js/[name].js' : 'js/[name].[chunkhash].js',
        chunkFilename: __DEV__ ? 'js/[name].js' : 'js/[name].[chunkhash].js',
        publicPath: ''
    },
    module: {
        rules: [
            {
                test: /\.(jsx|js)$/,
                include: SRC_PATH,
                loader: 'babel-loader'
            }]
    },
    resolve: {
        modules: [SRC_PATH, "node_modules"],
        alias: {
            'react-router': NODE_MODULES_PATH + '/react-router/lib/index.js',
            'react-redux': NODE_MODULES_PATH + '/react-redux/lib/index.js'
        },
        //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
        extensions: ['.js', '.json', '.jsx']
    },
    plugins: [
        new HtmlWebpackPlugin({
            minify: {
                collapseWhitespace: true
            },
            chunks: ['app', 'libs'],
            template: SRC_PATH + '/app.ejs'
        }),
        new ExtractTextPlugin({
            filename: 'css/[name].[contenthash].css',
            disable: __DEV__,
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: ["libs","manifest"], 
            minChunks: Infinity
        })
    ],
    watch: true,
    devServer: {
	  contentBase: path.join(__dirname, "dist"),
	  compress: true,
	  port: 9000
	}
}
```
我们不难发现，日常开发比较常用的就那么几个属性：<mred>entry</mred>、<mred>output</mred>、<mred>module</mred>、<mred>resolve</mred>、<mred>plugins</mred>、<mred>devtool</mred>，<mred>context</mred>，<mred>watch</mred>，<mred>devServer</mred>只不过根据项目的复杂度，具体的配置会有不同的变化，下面介绍一下具体每个属性的作用和对应的参数的作用。

#### <mblack>entry</mblack>
根据词意，可以知道这是入口，简而言之就是你需要打包的入口js文件，路径和名称就在这里定义的，<mred>webpack</mred>打包的时候会找到这个入口文件，然后根据入口文件写入的依赖解析路径去引入对应的模块。写法也比较灵活，可以写成以下三种形式：

1. 单页面应用入口，String类型
```javascript
entry: "./src/app.js"
```
2. 多页面应用入口，Array类型
```javascript
entry: ["./src/app1.js","./src/app2.js"]
```
3. 多页面应用入口，Object类型
```javascript
entry: {
    chunk1: "./src/app1.js",
    chunk2: "./src/app2.js"
}
```
如果想把不同的<mred>chunk</mred>区别开来，推荐用**Object**的形式，**Object**的**key**值对应了每个<mred>chunk</mred>的名称，使结构更清晰。

#### <mblack>output</mblack>
该属性对应了打包的输出配置项，类似这样：
```javascript
output: {
    path: './dist',
    filename:'js/[name].bundle.js',//或者'js/[id].bundle.js'、'js/[name].[hash].bundle.js'、'js/[chunkhash].bundle.js'
    chunkFilename:'js/[name].js',
    publicPath: '/'
}
```

<mred>path</mred> 代表了打包后输出的目录路径，为绝对路径。

<mred>filename</mred> 代表了打包输出文件的名称，对应的是从入口进入的<mred>chunk</mred>打包后的文件名，其中<mred>[name]</mred>属性会被<mred>chunk</mred>的名字替换，<mred>[id]</mred>会被模块id（chunk id）所替换，<mred>[hash]</mred>会被每次构建产生的唯一的<mred>hash</mred>值替换，<mred>[chunkhash]</mred>会被根据<mred>chunk</mred>内容生成的<mred>hash</mred>值替换。

<mred>chunkFilename</mred> 是为了那些不是从标准入口进入的<mred>chunk</mred>命名用的，比较常见的就是通过<mred>CommonsChunkPlugin</mred>打包基础模块，比如<mred>react</mred>、<mred>redux</mred>这类的模块，而不是用户自己写的<mred>chunk</mred>模块，命名规则参考<mred>filename</mred>，是一样的。

<mred>publicPath</mred>这个配置项是为一些外部引入的资源如（图片，文件等）设置外部访问的公共<mred>URL</mred>，为什么要这么做呢？原因其实很简单，一句话概括就是开发环境和生产环境的不同，举个栗子：
比如你在开发环境写代码的时候你有一张图片是这么引入的
```javascript
// page/login/index.css
background-image:'../../img/login.png'

//你的目录结构
├── app.html
├── app.js
├── css
│   └── index.css
├── img
│   └── logo.png
└── page
    └── login
        ├── index.css
        └── login.js
```
之后不管你是启动本地服务器或者发布到正式环境，都会进行一次打包，不管打包进内存或到某个输出目录，你的目录结构可能就变成这样：
```javascript
//dist
├── css
│   └── app.css
├── img
│   └── logo.png
└── index.html
```
很显然，目录的层级发生了变化，这时候你原先写的相对路径就变得不可靠了，会因找不到资源而报404，<mred>publicPath</mred>就是为了解决这个而提出的，它可以是相对路径也可以是绝对路径，以下摘一段官网的配置说明：
```javascript
publicPath: "https://cdn.example.com/assets/", // CDN（总是 HTTPS 协议）
publicPath: "//cdn.example.com/assets/", // CDN (协议相同)
publicPath: "/assets/", // 相对于服务(server-relative)
publicPath: "assets/", // 相对于 HTML 页面
publicPath: "../assets/", // 相对于 HTML 页面
publicPath: "", // 相对于 HTML 页面（目录相同）
```
它当做相对路径写的时候可以相对于自己本身或者服务器的根目录的，所以我们之前如果设置了<mred>publicPath</mred>，比如这样：
```javascript
publicPath: '/img/' //相对于服务器根目录
publicPath: '../img/' //相对于自己
```
那么最后我们在<mred>app.css</mred>里面看到的路径就会是这样：
```javascript
// app.css
background-image:'/img/login.png' //相对于服务器根目录
background-image:'../img/login.png' //相对于自己
```
怎么样，这样就很清晰了吧。这里还得提一点需要注意的，<mred> output.publicPath</mred>只是默认构建的时候的全局配置，有些<mred>loader</mred>也有自己的<mred>publicPath</mred>，这就看具体情境了，如果<mred>loader</mred>也配置了，那默认就是以<mred>loader</mred>配置的为主。

>有些童鞋很惧怕这种属性，觉得和<mred>Path</mred>很像，就默认是差不多用处了，不会再去深究。这样对知识的积累很不好，记住一个原则，配置或属性只是为了给我们提供方便，没必要去惧怕它，都是为了解决某些问题而提出的，当我们明白它的用途，我们才能更好的解读配置的意义。

#### <mblack>devtool</mblack>
<mred>devtool</mred>可以让打包后的文件支持<mred>source-map</mred>，以对打包压缩后的代码进行调试，贴一张官网的配置参数图：
```javascript
  devtool: "source-map", // enum
  devtool: "inline-source-map", // 嵌入到源文件中
  devtool: "eval-source-map", // 将 SourceMap 嵌入到每个模块中
  devtool: "hidden-source-map", // SourceMap 不在源文件中引用
  devtool: "cheap-source-map", // 没有模块映射(module mappings)的 SourceMap 低级变体(cheap-variant)
  devtool: "cheap-module-source-map", // 有模块映射(module mappings)的 SourceMap 低级变体
  devtool: "eval", // 没有模块映射，而是命名模块。以牺牲细节达到最快。
  // 通过在浏览器调试工具(browser devtools)中添加元信息(meta info)增强调试
  // 牺牲了构建速度的 `source-map' 是最详细的。
```
#### <mblack>context</mblack>
该配置项设置<mred>webpack</mred>的主目录<mred>entry</mred>和 <mred>module.rules.loader</mred>选项相对于此目录解析，也就是以设置的目录为基准解析路径。

#### <mblack>module</mblack>
这个选项为了处理项目中的不同类型的模块，配置也比较复杂，本文只拿常用的出来讲解，想看详细的配置说明请看[<mlink>官网</mlink>](https://doc.webpack-china.org/configuration/module)，之前注释里说的<mred>webpack</mred>不同版本的问题，这里就有体现，对于<mred>webpack@1.x</mred>版本下，<mred>module</mred>的配置可能是下面这样：
```javascript
module: {
        loaders: [
            {test: /\.js$/, loader: 'babel'},
            {test: /\.css$/, loader: 'style!css'},
            {test: /\.(jpg|png|gif|svg)$/, loader: 'url?limit=8192}
        ]
    }
```
而<mred>webpack@2.x</mred>版本下，则写法统一改成这样：
```javascript
    module: {
        rules: [
            {
                test: /\.(jsx|js)$/,
                include: SRC_PATH,
                loader: 'babel-loader'
            }]
    }
```
值得一提的是，不仅写法变了，<mred>webpack@2.x</mred>以后，<mred>-loader</mred>都不能被省略，不然会报语法错误。

<mred>rules</mred>是<mred>module</mred>的核心属性，它会提供一种规则数组，创建模块时，会去匹配并修改模块的创建方式。每个规则可以分为三部分<mred>条件(condition)</mred>，<mred>结果(result)</mred>和<mred>嵌套规则(nested rule)</mred>。

<mred>条件(condition)</mred>很好理解，举个栗子：
```javascript
//app.js
import './css/index.css'
```
<mred>条件(condition)</mred>包括了被引入文件<mred>./css/index.css</mred>和导入这个文件的模块<mred>app.js</mred>两个文件的绝对路径。你也可以通过制定<mred>test</mred>的规则去匹配和筛选<mred>条件(condition)</mred>所匹配的文件流。

<mred>结果(result)</mred>里面包含了一些<mred>loader</mred>，当<mred>条件(condition)</mred>满足时，会去匹配对应的被引入的文件流，对这些文件进行处理，生成对应的js模块。简单来说，对引入文件的预处理就在这里面，比如把ES6语法编译成ES5，把JSX编译成ES5，把引入的css，img转换成js模块等等。

<mred>嵌套规则(nested rule)</mred>可以使用属性<mred>rules</mred>和<mred>oneOf</mred>指定嵌套规则。这些规则用于在<mred>规则条件(rule condition)</mred>匹配时进行取值。

#### <mblack>resolve</mblack>
这个选项能设置模块如何被解析，简单来说就是通过一定的规则去预定义<mred>webpack</mred>查找模块的方式，举个简单的栗子：
比如你在<mred>app.js</mred>这样引入一个<mred>login模块</mred>
```javascript
//app.js
import login from './router/login';
```
如果你设置了<mred>resolve</mred>参数，比如这样：
```javascript
//webpack.config.js
 alias: {
           'login':path.resolve(__dirname, 'src/router/login'),
        }
```
你可以把之前的相对路径直接替换成：
```javascript
//app.js
import login from 'login';
```
这样写是不是简洁不少？当<mred>webpack</mred>查找<mred>login模块</mred>时，会直接根据你设置的绝对路径去查找，当层级很深的时候，再按相对路径去找明显太蠢了，这样写不仅省时，代码的可读性也更高了，下面简单介绍一下它的其他几个参数（比较常用）。

<mred>extensions</mred>是用来自动解析模块扩展名的，这个懒人必备，哈哈，写法如下：
```javascript
//webpack.config.js
extensions: [".js", ".json",".jsx"]
```
这样你再引入模块的时候就不用写扩展名了：
```javascript
//app.js
import userList from 'login/userList.jsx'; //设置之前
import userList from 'login/userList'; //设置之后
```
设置之后，<mred>webpack</mred>再解析模块的时候会自动补全扩展名。

<mred>modules</mred>告诉<mred>webpack</mred>解析模块时应该搜索的目录。默认是搜索<mred>node_modules</mred>，搜索方式类似<mred>node</mred>通过相对路径一层层往上找。当我们想让<mred>webpack</mred>搜索指定目录，提高搜索效率的时候，也可以这么写
```javascript
//webpack.config.js
modules: [path.resolve(__dirname, "src"), "node_modules"]
```
这样<mred>webpack</mred>会在搜索<mred>node_modules</mred>之前先搜索你指定的目录，此路径应是绝对路径。

#### <mblack>plugins</mblack>

<mred>plugins</mred>为<mred>webpack</mred>的插件列表，这个看具体插件，不同插件的写法不同，但都是实例化了一个对象，比如这样：
```javascript
 plugins: [
        new HtmlWebpackPlugin({
            minify: {
                collapseWhitespace: true
            },
            chunks: ['app', 'libs'],
            template: SRC_PATH + '/app.ejs'
        }),
        new ExtractTextPlugin({
            filename: 'css/[name].[contenthash].css',
            disable: __DEV__,
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: ["libs","manifest"], 
            minChunks: Infinity
        })
    ]
```
>善用插件可以帮我们简化开发流程，之后的博客会介绍一下比较常用<mred>webpack</mred>插件及其配置。

#### <mblack>watch</mblack>

<mred>watch</mred>模式意味着在初始构建之后，<mred>webpack</mred>将继续监听任何已解析文件的更改，这个配置项我们基本不用去设置，因为开了下面这个配置项是默认开启<mred>watch</mred>模式的。

#### <mblack>devServer</mblack>

<mred>devServer</mred>是<mred>webpack</mred>的本地服务器，它使我们的开发变的自动而高效，由于它的配置项很多，我们这里也只讲常用的几个。

<mred>contentBase</mred>告诉服务器从哪里提供内容，<mred>webpack</mred>的本地服务器本质上是一个通过node启动的本地资源服务器，这里要了解个概念，通过本地服务器打包是不会生成实体文件的，而是会写进内存里面，既然没实体文件，那我们能提供的静态资源也只能是我们本地的资源文件，这就是<mred>contentBase</mred>的作用，默认是项目根目录：
```javascript
contentBase: '/'
```
当然你也可以自定义路径，比如我有一个目录结构是这样的：
```javascript
.
├── README.md
├── node_modules
├── package.json
├── src
│   ├── app.js
│   └── index.html
└── webpack.config.js
```
当你没设置<mred>contentBase</mred>时
```javascript
devServer: {
	  compress: true,
	  port: 9000
	}
```
你启动本地服务器后，因为默认是项目根目录，也就是这样
```javascript
http://localhost:9000/
```
很显然，根目录下面没有静态资源可以加载的，我们的静态资源都在<mred>src</mred>里面，所以会出现下面的情况
![webpack的配置解析](webpack的配置解析/error.png)
当我们进入<mred>src</mred>里面的时候发现资源加载成功了
![webpack的配置解析](webpack的配置解析/work.png)
所以我们可以试着把<mred>contentBase</mred>加上
```javascript
devServer: {
     contentBase: __dirname+'/src/',
	  compress: true,
	  port: 9000
	}
```
再启动本地服务器，会看到这么一句话
```javascript
content is served from /Users/fengji/Desktop/demo/src/
```
代表我们设置成功了，这时候你打开9000端口可以看到这样
![webpack的配置解析](webpack的配置解析/success.png)
这样就请求到了我们本地资源，要是你嫌设置麻烦，推荐使用<mred>html-webpack-plugin</mred>它会帮你把资源路径正确定义到你html页面的文件夹下。

<mred>compress</mred>代表是否启用<mred>gzip 压缩</mred>，推荐都设置为<mred>true</mred>，加载压缩完后的资源能加快构建速度。

<mred>port</mred>为你要开启服务器的端口。

<mred>inline</mred>设置为<mred>true</mred>，<mred>webpack</mred>会把一段实时刷新页面的脚本内联进你打包后的<mred>bundle</mred>文件里，你可以在控制台实时看到构建的信息。设置为<mred>flase</mred>，则用<mred>iframe</mred>内嵌html的形式构建，消息会实时显示在页面上，两种方式都可以用，个人比较偏向启用，控制台看起来直观一点。

<mred>hot</mred>模式为不刷新页面的情况下进行模块的热替换，这个才是自动化构建的精髓啊，强烈推荐开启！来体验实时构建的快感吧。
>多提一句，要开启<mred>hot</mred>模式，还需要一个插件的支持<mred>webpack.HotModuleReplacementPlugin</mred>，直接用就行了，也很方便。

配置讲解差不多就这么多了，有哪里说的不对的，欢迎在底下评论，大家一起交流进步，后面可能会讲一些插件的用法，或者构建一个完整项目的流程，怎么区分生产和开发环境等等。。
#### 备注：本篇博客皆为博主原创，转发请标明出处。
