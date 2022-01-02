---
title: 工作中遇到的bug整理
date: 2018-04-02 13:52:45
categories: 工作笔记
tags: bugs
---

![bug整理](/images/bug.jpg)

本篇主要为了整理和收集日常开发中遇到的各种 bug，防止下次再犯同样的错误，包括了 pc 端，低版本 IE 的兼容问题和移动端 ios、安卓的兼容问题。<!-- more -->

<!-- more -->

## <mblue>PC 端 bug 整理收集</mblue>

### <mblack>1. IE 低版本浮动错位问题</mblack>

#### 问题分析

IE6/IE7/IE8<mred>float:right</mred>属性，会导致换行，而不是在同一行显示。

#### 解决办法

将<mred>float:right</mred>属性写在<mred>float:left</mred>或者不浮动的元素之前。

## <mblue>移动端 bug 整理收集</mblue>

### <mblack>1. fixed 键盘兼容问题</mblack>

#### 问题分析

ios 和部分安卓机型，当键盘弹出的时候，底部<mred>fixed</mred>布局的元素，会被键盘顶到上面来，导致布局错位。

#### 解决办法

ios 通过更改为<mred>flex</mred>布局，可以解决，而部分安卓机型还是有问题，最终解决办法是通过 js 获取当前手机视窗的高度，给最外面的容器加一个<mred>min-height</mred>，good！完美解决 bug。

###<mblack>2. fixed 导致 ios 光标移位</mblack>

#### 问题分析

在用<mred>vue</mred>搭建项目的时候，发现当用<mred>input</mred>框进行内容输入的时候，经常会发生光标移位的问题，定位不准，不能很好的在<mred>input</mred>框上获得焦点

#### 解决办法

ios 通过更改为<mred>flex</mred>布局，可以解决，而部分安卓机型还是有问题，最终解决办法是通过 js 获取当前手机视窗的高度，给最外面的容器加一个<mred>min-height</mred>，good！完美解决 bug。
