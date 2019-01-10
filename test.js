function factory(name, age) {
    var obj = new Object();
    obj.name = name;
    obj.age = age;
    obj.dosth = function () {
        console.log('做些事!');
    }
    return obj;
}
var example1 = factory('redjue', 24) // {name: "redjue", age: 24, dosth: ƒ}

//构造函数解决了工厂模式反复创建函数方法的弊端，减少了对象的体积
function constructor(name, age) {
    this.name = name;
    this.age = age;
    construction.prototype.dosth = function () {
        console.log('做些事!');
    }
}
var example2 = new constructor('redjue', 24);//{name: "redjue", age: 24} 
example2.dosth() //做些事!
//constructor.prototype
{
    dosth: function() {
        console.log('做些事!');
    },
    constructor: constructor(name, age){...},
    __proto__: Object
}
constructor.call(newObj);
//也可以形象的表示成这样
newObj = {
    constructor: function (name, age) {
        this.name = name;
        this.age = age;
        this.construction.prototype.dosth = function () {
            console.log('做些事!');
        }
    }
}
newObj.constructor('redjue', 24);

function parent() {
    //父类
    this.name = 'parent';
    this.age = 56;
    parent.prototype.dosth = function () {
        console.log('做些事!');
    }
}
function child() {
    //子类
    this.name = 'child';
    this.age = 24;
}

//连接原型链
child.prototype = new parent();
var child = new child();
child.dosth() //'做些事!'

//子类原型
{
    age: 56,
        name: "parent",
            __proto__: Object
}

function parent() {
    //父类
    this.name = 'parent';
    this.age = 56;
    parent.prototype.dosth = function () {
        console.log('做些事!');
    }
}
function child() {
    //子类
    this.name = 'child';
    this.age = 24;
    //将父类的属性在子类中私有化
    parent.call(this);
}

//连接原型链
child.prototype = new parent();
//将child原型的constructor指向child自身，默认状态指向的是parent，显然有问题
child.prototype.constructor = child;
var _child = new child();
_child.dosth() //'做些事!'

class parent {
    constructor() {
        this.name = 'redjue';
        this.age = 24
    }
    dosth() {
        console.log('做些事!')
    }
}
var _parent = new parent();

{
    constructor: class parent,
    dosth: ƒ dosth(),
        __proto__:Object
}
class parent {
    constructor() {
        this.name = 'redjue';
        this.age = 24
    }
    dosth() {
        console.log('做些事!')
    }
}
class child extends parent {
    constructor() {
        super();
        this.career = 'programmer'
    }
}
var _child = new child();//{name: "redjue", age: 24, career: "programmer"}

{
    constructor: class child,
    __proto__: Object
}


var _parent = new parent();
_parent.ifVisit();//_parent.ifVisit is not a function
parent.ifVisit();//访问到了！

//module.js 定义模块
define(function () {
    return function (a, b) {
        console(a + b);
    }
});
//引入
require(['module'], function (module) {
    module(1 + 2);//3
});


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
    devtool: 'eval',
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
        })
    ]
}
{
    thunk1: "./src/app1.js",
        thunk2: "./src/app2.js"
}
output: {
    path: './dist',
    filename:'js/[name].js',
    chunkFilename:'js/[name].js',
    publicPath: '/'
}