---
title: 谈谈js的原型与继承
date: 2017-08-26 14:12:37
categories: 知识点汇总
tags: 原型与继承
---

![谈谈js的原型与继承](/images/pic.jpg)
javascript 是一门弱类型的语言，所以并没有像 java 这种有类的概念，自然也没有子类继承父类这一说，但是所幸 js 有自己的一套继承机制，下面我就来谈谈关于 js 的继承我的一点微薄的理解。<!-- more -->

<!-- more -->

## <mblue>构造函数</mblue>

js 创建对象的方式有很多，比如对象字面量直接创建啊，类似这样：

```javascript
//这种算是最简单的创建对象的方法，简单粗暴
var obj = new Object(); //或者
var obj = {};
```

或者工厂模式创建，类似这样：

```javascript
//当你需要批量创建对象时可以用工厂模式统一创建
function factory(name, age) {
  var obj = new Object();
  obj.name = name;
  obj.age = age;
  obj.dosth = function () {
    console.log("做些事!");
  };
  return obj;
}
var example1 = factory("redjue", 24); // {name: "redjue", age: 24, dosth: ƒ}
```

亦或者构造函数模式创建，类似这样：

```javascript
//构造函数解决了工厂模式反复创建函数方法的弊端，减少了对象的体积
function constructor(name, age) {
  this.name = name;
  this.age = age;
  constructor.prototype.dosth = function () {
    console.log("做些事!");
  };
}
var example2 = new constructor("redjue", 24); //{name: "redjue", age: 24}
example2.dosth(); //做些事!
```

js 的新手看到构造函数这可能会比较迷。。对象里没有<mred>dosth</mred>这个方法，它怎么还能调用到？是被什么‘吃’了吗，事实上它确实被‘吃’了，它被<mred>constructor</mred>的原型对象给接管了，具体形式如下：

```javascript
//constructor.prototype
{
    dosth:function(){
        console.log('做些事!');
    },
    constructor:constructor(name, age){...},
    __proto__:Object
}
```

那么为什么<mred>example2</mred>能调用到<mred>constructor</mred>原型对象里的方法呢，构造函数的原型对象与他实例化的对象之间是通过什么连接起来的呢？这就要提到另一个概念，原型链的传递。

## <mblue>原型链的传递</mblue>

### <mblack>构造函数创建实例的过程</mblack>

构造函数通过<mred>new</mred>关键字来创建实例对象，具体过程如下：

1. 创建一个空对象。
2. 将构造函数的作用域赋值给这个空对象，也就是改变<mred>this</mred>指向。
3. 根据构造函数中创建对象的代码，实例化这个空对象。
4. 返回这个新对象。

我们一步步来看，创建一个空对象就是直接通过对象字面量直接创建一个对象：

```javascript
var newObj = new Object();
```

第二步中所做的，可以用以下代码表示：

```javascript
//让constructor构造函数在newObj的环境下执行，this自然指向newObj
constructor.call(newObj);
//也可以形象的表示成这样
newObj = {
  constructor: function (name, age) {
    this.name = name;
    this.age = age;
    this.constructor.prototype.dosth = function () {
      console.log("做些事!");
    };
  },
};
```

第三步，如下：

```javascript
//当然constructor并没有在newObj里面，这段代码只是表示了和call函数做的一样的事
newObj.constructor("redjue", 24);
```

第四步，返回构造函数的实例：

```javascript
return newObj;
```

至此，我们通过构造函数创建了一个实例对象，但是这个过程看起来似乎并没有关于原型链传递的操作对不对？其实嘛，js 的底层都帮我们解决了，这里要介绍一个有关原型链传递的关键属性`__proto__`。

### <mblack>proto 属性</mblack>

这个属性为什么能关乎原型链的传递呢？原因就在实例化对象的过程中，<mred>constructor</mred>把自己的原型对象当做一个属性值赋值给了<mred>newObj</mred>，
而这个被赋值的属性就是`__proto__`，这是一个特殊的属性，专门用来保存指向对应原型的指针。所以当在调用实例对象自己本身没有的属性或方法时，通过这个属性的指向，我们可以去<mred>constructor</mred>的原型里面查找，这一过程称为原型链的传递。特别要注意的一点，这一过程只发生在实例对象与原型之间，而和<mred>constructor</mred>没什么关系。

## <mblue>ES5 继承的实现</mblue>

为什么要说 ES5 继承呢，主要是 ES6 出了一个新特性 class，通过更优雅的语法来实现继承，但本质上来说和 ES5 的继承方式是一样的，只不过是一个语法糖，后面再谈 ES6 继承的一些特性和实现原理。

### <mblack>常规的实现方式</mblack>

我们知道了原型链的传递是发生在实例对象和原型之间的，那么我们如果想要实现继承的话，就可以把它们连接起来，类似这样：

```javascript
function parent() {
  //父类
  this.name = "parent";
  this.age = 56;
  parent.prototype.dosth = function () {
    console.log("做些事!");
  };
}
function child() {
  //子类
  this.name = "child";
  this.age = 24;
}

//连接原型链
child.prototype = new parent();
var child = new child();
child.dosth(); //'做些事!'
```

子类的实例对象可以通过搜索原型链往上找，最终找到父类原型里面的<mred>dosth</mred>方法。但是这样做有个问题，我们来看看子类的原型：

```javascript
//子类原型
{
    age: 56,
    name: "parent",
    __proto__: Object
}
```

发现问题了吗，子类的原型就是父类的实例对象，意味着这个实例对象里面的属性其实是作为原型里的属性而存在的，这违背了属性私有化的理念，我们只是想把方法进行复用，而属性并不需要共有。

### <mblack>借用构造实现组合继承</mblack>

既然我们遇到了这个问题，那么有没有什么办法能解决这个问题？有大神用了一种巧妙的办法规避了这个问题，这就是借用构造函数：

```javascript
function parent() {
  //父类
  this.name = "parent";
  this.age = 56;
  parent.prototype.dosth = function () {
    console.log("做些事!");
  };
}
function child() {
  //子类
  this.name = "child";
  this.age = 24;
  //将父类的属性在子类中私有化
  parent.call(this);
}

//连接原型链
child.prototype = new parent();
//将child原型的constructor指向child自身，默认状态指向的是parent，显然有问题
child.prototype.constructor = child;
var _child = new child();
_child.dosth(); //'做些事!'
```

这样我们保证了，<mred>child</mred>的每个实例对象都有<mred>parent</mred>定义的私有属性，而不是共享<mred>\_child</mred>继承的<mred>parent</mred>的实例里面的共有属性，实现了属性私有，方法复用的比较完美的组合继承。

## <mblue>ES6 继承的实现</mblue>

### <mblack>class，static，extend 和 super 关键字</mblack>

ES6 引入了一个新的概念<mred>class</mred>，也就是类，形式类似这样：

```javascript
class parent {
  constructor() {
    this.name = "redjue";
    this.age = 24;
  }
  dosth() {
    console.log("做些事!");
  }
}
var _parent = new parent(); //{name: "redjue", age: 24}
```

粗粗一看，哇，好高大上的感觉，但是仔细看看类里面的内容，卧槽，这不就是原型对象里面的东西吗。。如果我们把<mred>\_parent</mred>这个实例的原型打印出来，如下所示：

```javascript
{
    constructor: class parent,
    dosth: ƒ dosth(),
    __proto__:Object
}
```

是不是一目了然了，<mred>class</mred>里面定义的就是原型对象里面的属性而已，通过<mred>class</mred>关键字，我们可以在<mred>class</mred>里面一起定义原型属性和构造函数的自定义属性，这种方式相比较 ES5 的在构造函数里定义显的更加优雅和直观，通过类来 new 一个对象也就顺理成章，不会像 ES5 用构造函数来 new 一个对象那么生硬。

接下来说说<mred>static</mred>关键字，这个很有意思，他可以隔离实例与原型对象的联系，换句话说，你用<mred>static</mred>定义的方法，并不能被实例所访问到，所以是静态的，而不是共有的，类似下面这样：

```javascript
class parent {
  constructor() {
    this.name = "redjue";
    this.age = 24;
  }
  static ifVisit() {
    console.log("访问到了！");
  }
  dosth() {
    console.log("做些事!");
  }
}
var _parent = new parent();
_parent.ifVisit(); //_parent.ifVisit is not a function
parent.ifVisit(); //访问到了！
```

这给我们在某些特定情况下不想让实例访问我们原型里定义的方法提供了方便，也更严谨了。

ES6 提出了一种全新的继承方式，形式和<mred>java</mred>的继承看上去很像，通过<mred>extend</mred>关键字来实现：

```javascript
class parent {
  constructor() {
    this.name = "redjue";
    this.age = 24;
  }
  dosth() {
    console.log("做些事!");
  }
}
class child extends parent {
  constructor() {
    super();
    this.career = "programmer";
  }
}
var _child = new child(); //{name: "redjue", age: 24, career: "programmer"}
_child.dosth(); //做些事!
```

完美！既把父类的属性私有化了，又继承到了父类原型里的<mred>dosth</mred>方法，让我们把<mred>\_child</mred>的原型输出来看看：

```javascript
{
    constructor: class child,
    __proto__: Object
}
```

我们发现原型的<mred>constructor</mred>指向的是 class child，那父类的属性是怎么跑到子类里的呢？，秘密就在<mred>super</mred>关键字。

<mred>super</mred>关键字和我们之前探讨过的 ES5 继承里面的借用构造其实是一个意思，<mred>super</mred>是 ES6 向我们提供的语法糖而已，等价于 ES5 的<mred>parent.call(this)</mred>,区别在于 ES6 语法规定不用<mred>super</mred>关键字就没有<mred>this</mred>指向，所以不能直接替换用，只是底层原理是类似的：

```javascript
{
  class child extends parent {
    constructor() {
      super(); //类似于parent.call(this)
      this.career = "programmer";
    }
  }
}
```

### <mblack>ES6 继承实现的原理</mblack>

ES6 实现继承其实也就走了两条路，属性的私有化和方法的共有化，大致过程如下：

```javascript
class child.__proto__=class parent;//属性私有化
class child.prototype.__proto__=class parent.prototype;//方法共有化
```

ES5 的组合继承根本上讲也就是为了实现以上两种情况，只不过 ES6 的实现更加优雅，还有一点值得指出来的是，ES5 构造函数的`__proto__`永远指向的是<mred>Function</mred>对象的原型，不会因为实例的继承而改变指向，而在 ES6 中不一样，当子类继承父类之后，子类的`__proto__`会指向父类，这样表示显得更加规范，也清楚明了的表示了子类继承了父类的属性。

#### 备注：本篇博客皆为博主原创，转发请标明出处。
