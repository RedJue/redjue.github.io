---
title: webpack常用插件整理
date: 2017-09-19 19:54:15
tags: webpack plugin
---
![webpack常用插件整理](webpack常用插件整理/timg.jpg)

webpack有很多很好用的插件，它们帮助我们日常的开发效率提高了不少，本篇博客将着重介绍一些通用的插件，适合不同框架的项目使用。

<!-- more -->

## <mblue>html-webpack-plugin</mblue>

一个项目，不管是多页面应用还是单页面应用，都需要有<mred>html</mred>页面来承载内容，本来是一件比较容易的事，但是在<mred>webpack</mred>这个环境下，有些地方会让人觉得不是很舒服。
### 静态资源路径问题
举个最简单的栗子，上次讲解<mred>webpack</mred>配置的时候也提过，就是开启本地服务器需要配置静态资源目录路径。
```javascript
contentBase: '/' //默认解析静态资源的路径
contentBase: '/src/' //手动指向静态资源目录的路径
```
这是其中一个麻烦的点，不同项目还得配不同的<mred>contentBase<mred>参数。
### 不能跟随js一起打包
<mred>webpack</mred>并没有那么智能会去解<mred>index.html</mred>的路径，它的设计初衷只是为了打包js而已，也就是如果你在资源目录里创建了一个<mred>html</mred>文件，<mred>webpack</mred>并不认识，自然也就不会自动打包到对应的打包目录，单页面还好，多页面的话简直是噩梦，还要自己手动<mred>copy</mred>页面，每次打包都会清空一次打包目录，意味着要一直重复这种操作，太累了。
### 页面引用资源的相对路径
最绝望的是如果你原来页面写的是相对路径来访问一些静态资源，转到打包目录，结构层次不一样，路径全得改。。。不敢想下去了，大工程啊。
### 无法便捷的利用缓存机制
想有效利用缓存，最方便的就是给引入的文件后缀加<mred>hash</mred>值或者时间戳，保证该文件的唯一性，这样当浏览器去解析该文件的时候，如果之前下载过，会直接读取缓存，减少一次请求资源的操作。但是每次你改了静态资源的内容，由于你需要更新内容，不得不改变对应的<mred>hash</mred>值，然后你需要自己手动改。。太麻烦了，这样一点都不自动化。
### html-webpack-plugin参数简介
以上的问题，我们可以通过<mred>html-webpack-plugin</mred>来进行解决，配置该插件也非常方便，如下：

```javascript
new HtmlWebpackPlugin({
            //html文件的标题
            title: 'My App',
            //简易压缩html文件的体积，去空格
            minify: {        
                collapseWhitespace: true
            },
            //会将hash值添加到每个引入的js和css文件上
            hash:true, 
            //允许生成的html页面上引入不同的chunkjs，而不是默认的入口js   
            chunks: ['app', 'libs'], 
            //Webpack需要的模板的路径，用过模板文件的童鞋应该知道是干嘛的
            template: SRC_PATH + '/app.ejs', 
            //要写入HTML的文件。默认为index.html。您也可以在这里指定一个子目录（例如：assets / admin.html）。
            filename: 'index.html'         }),
```
其他一些具体的参数参考[<mlink>这里</mlink>](https://github.com/jantimon/html-webpack-plugin#configuration)，对应的模板文件参考如下写法：

```javascript
//app.ejs
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8"/>
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
  </body>
</html>
```
当然你直接用html文件也是一样的，剩下的<mred>html-webpack-plugin</mred>会帮你搞定的，享受自动化的构建体验吧！

## <mblue>extract-text-webpack-plugin</mblue>

当我们开发的时候，<mred>css-loader</mred>和<mred>style-loader</mred>可以方便的把样式打包进js里面，并以<mred>style</mred>标签形式内嵌在页面上,这为我们提供了方便，因为是打包进去的，所以也支持<mred>webpack</mred>的热更新，但在生产环境下就比较尴尬了，具体有以下几个问题：

### 内嵌的结构不清晰，增大了页面的体积
这个问题反映在比较大的项目里，<mred>css</mred>通常都会比较多，全部挤在一起，也不易维护和调试。由于是内嵌的代码也无法使用<mred>sources map</mred>，代码的优雅性也大大降低。

### 无法有效利用缓存机制和CDN
给文件后缀加hash或时间戳是利用缓存的常用形式，但这局限于css实体文件，<mred>CDN</mred>引流资源也是一样，内嵌的形式限制了很多功能的实现。

### extract-text-webpack-plugin参数简介
为了享受实体<mred>css</mred>文件的好处，我们选择了这个插件来处理<mred>css-loader</mred>处理过的<mred>css</mred>模块，下面贴出常用的一些配置属性：

```javascript
new ExtractTextPlugin({
            //默认自动生成，id为此插件实例的唯一标识符
            id:chunkId,
            //输出的css文件名，可以包括[name]，[id]和[contenthash]
            filename: 'css/[name].[contenthash].css',
            //禁用插件
            disable: __DEV__,
            //从所有附加chunk中提取css文件（默认情况下，它仅从初始块中提取）， 当使用CommonsChunkPlugin并且在commons chunk中有提取的块时，allChunks必须设置为true
            allChunks: true
        })
```
这样配置只能提取纯<mred>css</mred>样式，如果我们项目中有用一些<mred>css预编译器</mred>，比如<mred>sass</mred>，<mred>less</mred>，<mred>styl</mred>等等，光这样还不够，我们还需要配置另一个方法：
```javascript
ExtractTextPlugin.extract({
    //当CSS未被提取时应该使用的loader
    fallback: "style-loader",
    //将资源通过配置的loader来转换为css（必填，支持预处理器就靠这个参数）
    use: ['css-loader', 'sass-loader'],
    //覆盖默认的publicPath设置
    publicPath:'/'
});
```
如果配置顺利的话，最后打包上线在页面上显示的应该就是这个样子：
```javascript
<link href="css/app.ff056f366d9a3c7632b010597cbcd7ba.css" rel="stylesheet">
```
这符合我们的预期，通过配置，我们也可以区别生产和开发环境，这个以后会讨论。