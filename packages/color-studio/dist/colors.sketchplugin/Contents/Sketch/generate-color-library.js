var that = this;
function __skpm_run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./extensions/sketch/generate-color-library.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./dist/colors.json":
/*!**************************!*\
  !*** ./dist/colors.json ***!
  \**************************/
/*! exports provided: version, colors, default */
/***/ (function(module) {

module.exports = {"version":"0.9.9","colors":[[{"name":"Gray 50","value":"#e7e7e7","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":50}},{"name":"Gray 100","value":"#ccced0","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":100}},{"name":"Gray 200","value":"#b0b5b8","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":200}},{"name":"Gray 300","value":"#969ca1","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":300}},{"name":"Gray 400","value":"#7c848b","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":400}},{"name":"Gray 500","value":"#636d75","_meta":{"baseColor":true,"baseName":"Gray","colorFormula":"primary","shadeIndex":500}},{"name":"Gray 600","value":"#50575d","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":600}},{"name":"Gray 700","value":"#3d4145","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":700}},{"name":"Gray 800","value":"#2b2d2f","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":800}},{"name":"Gray 900","value":"#1a1a1a","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":900}}],[{"name":"Blue 50","value":"#e0e5e9","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":50}},{"name":"Blue 100","value":"#bbc9d5","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":100}},{"name":"Blue 200","value":"#95adc1","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":200}},{"name":"Blue 300","value":"#6f93ad","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":300}},{"name":"Blue 400","value":"#46799a","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":400}},{"name":"Blue 500","value":"#016087","_meta":{"baseColor":true,"baseName":"Blue","colorFormula":"primary","shadeIndex":500}},{"name":"Blue 600","value":"#204a69","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":600}},{"name":"Blue 700","value":"#23354b","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":700}},{"name":"Blue 800","value":"#1d232f","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":800}},{"name":"Blue 900","value":"#111215","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":900}}],[{"name":"Purple 50","value":"#eae5ee","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":50}},{"name":"Purple 100","value":"#d4c8de","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":100}},{"name":"Purple 200","value":"#beabce","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":200}},{"name":"Purple 300","value":"#a88ebe","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":300}},{"name":"Purple 400","value":"#9273af","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":400}},{"name":"Purple 500","value":"#7c589f","_meta":{"baseColor":true,"baseName":"Purple","colorFormula":"primary","shadeIndex":500}},{"name":"Purple 600","value":"#634581","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":600}},{"name":"Purple 700","value":"#4b3264","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":700}},{"name":"Purple 800","value":"#342148","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":800}},{"name":"Purple 900","value":"#1f112e","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":900}}],[{"name":"Pink 50","value":"#f4e5eb","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":50}},{"name":"Pink 100","value":"#ebc6d5","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":100}},{"name":"Pink 200","value":"#e1a7bf","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":200}},{"name":"Pink 300","value":"#d688aa","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":300}},{"name":"Pink 400","value":"#c96895","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":400}},{"name":"Pink 500","value":"#bc4681","_meta":{"baseColor":true,"baseName":"Pink","colorFormula":"primary","shadeIndex":500}},{"name":"Pink 600","value":"#9b3c69","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":600}},{"name":"Pink 700","value":"#7b3252","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":700}},{"name":"Pink 800","value":"#5d283d","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":800}},{"name":"Pink 900","value":"#3f1f2a","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":900}}],[{"name":"Red 50","value":"#fbe2dd","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":50}},{"name":"Red 100","value":"#f8bfb4","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":100}},{"name":"Red 200","value":"#f19d8d","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":200}},{"name":"Red 300","value":"#e77a68","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":300}},{"name":"Red 400","value":"#da5544","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":400}},{"name":"Red 500","value":"#ca2622","_meta":{"baseColor":true,"baseName":"Red","colorFormula":"primary","shadeIndex":500}},{"name":"Red 600","value":"#a82620","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":600}},{"name":"Red 700","value":"#87241d","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":700}},{"name":"Red 800","value":"#68211a","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":800}},{"name":"Red 900","value":"#491d17","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":900}}],[{"name":"Orange 50","value":"#fceade","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":50}},{"name":"Orange 100","value":"#fad2b6","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":100}},{"name":"Orange 200","value":"#f5ba8f","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":200}},{"name":"Orange 300","value":"#eda268","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":300}},{"name":"Orange 400","value":"#e38a40","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":400}},{"name":"Orange 500","value":"#d7730f","_meta":{"baseColor":true,"baseName":"Orange","colorFormula":"primary","shadeIndex":500}},{"name":"Orange 600","value":"#b95e1b","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":600}},{"name":"Orange 700","value":"#994b1f","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":700}},{"name":"Orange 800","value":"#79391f","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":800}},{"name":"Orange 900","value":"#592a1b","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":900}}],[{"name":"Yellow 50","value":"#fbf3e4","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":50}},{"name":"Yellow 100","value":"#f7e5c0","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":100}},{"name":"Yellow 200","value":"#f1d79d","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":200}},{"name":"Yellow 300","value":"#e9ca7a","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":300}},{"name":"Yellow 400","value":"#e0bd56","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":400}},{"name":"Yellow 500","value":"#d6b02c","_meta":{"baseColor":true,"baseName":"Yellow","colorFormula":"primary","shadeIndex":500}},{"name":"Yellow 600","value":"#ba9830","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":600}},{"name":"Yellow 700","value":"#9e8132","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":700}},{"name":"Yellow 800","value":"#826b32","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":800}},{"name":"Yellow 900","value":"#675631","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":900}}],[{"name":"Green 50","value":"#e0eadd","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":50}},{"name":"Green 100","value":"#bcd3b5","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":100}},{"name":"Green 200","value":"#97bc8d","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":200}},{"name":"Green 300","value":"#73a567","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":300}},{"name":"Green 400","value":"#4d8e41","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":400}},{"name":"Green 500","value":"#1d7819","_meta":{"baseColor":true,"baseName":"Green","colorFormula":"primary","shadeIndex":500}},{"name":"Green 600","value":"#1e611e","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":600}},{"name":"Green 700","value":"#1e4a1e","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":700}},{"name":"Green 800","value":"#1d341d","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":800}},{"name":"Green 900","value":"#192019","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":900}}],[{"name":"Celadon 50","value":"#e1e9e6","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":50}},{"name":"Celadon 100","value":"#bad1cb","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":100}},{"name":"Celadon 200","value":"#93bab0","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":200}},{"name":"Celadon 300","value":"#6da296","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":300}},{"name":"Celadon 400","value":"#438c7d","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":400}},{"name":"Celadon 500","value":"#007565","_meta":{"baseColor":true,"baseName":"Celadon","colorFormula":"primary","shadeIndex":500}},{"name":"Celadon 600","value":"#195d52","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":600}},{"name":"Celadon 700","value":"#20473f","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":700}},{"name":"Celadon 800","value":"#20312d","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":800}},{"name":"Celadon 900","value":"#1d1d1d","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":900}}],[{"name":"Hot Blue 50","value":"#f0f6ff","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":50}},{"name":"Hot Blue 100","value":"#c1d7ff","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":100}},{"name":"Hot Blue 200","value":"#93b6ff","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":200}},{"name":"Hot Blue 300","value":"#6795fe","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":300}},{"name":"Hot Blue 400","value":"#3574f8","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":400}},{"name":"Hot Blue 500","value":"#005fb7","_meta":{"baseColor":true,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":500}},{"name":"Hot Blue 600","value":"#144b9b","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":600}},{"name":"Hot Blue 700","value":"#183780","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":700}},{"name":"Hot Blue 800","value":"#162566","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":800}},{"name":"Hot Blue 900","value":"#10144d","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":900}}],[{"name":"Hot Pink 50","value":"#fff0fa","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":50}},{"name":"Hot Pink 100","value":"#ffcaea","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":100}},{"name":"Hot Pink 200","value":"#ffa2d4","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":200}},{"name":"Hot Pink 300","value":"#ff76b8","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":300}},{"name":"Hot Pink 400","value":"#ff3997","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":400}},{"name":"Hot Pink 500","value":"#d52c82","_meta":{"baseColor":true,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":500}},{"name":"Hot Pink 600","value":"#b7266a","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":600}},{"name":"Hot Pink 700","value":"#992053","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":700}},{"name":"Hot Pink 800","value":"#7c1b40","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":800}},{"name":"Hot Pink 900","value":"#60162e","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":900}}],[{"name":"Hot Red 50","value":"#fff0e6","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":50}},{"name":"Hot Red 100","value":"#ffcfac","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":100}},{"name":"Hot Red 200","value":"#ffab78","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":200}},{"name":"Hot Red 300","value":"#ff8248","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":300}},{"name":"Hot Red 400","value":"#ff4b1c","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":400}},{"name":"Hot Red 500","value":"#eb0001","_meta":{"baseColor":true,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":500}},{"name":"Hot Red 600","value":"#cb0c07","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":600}},{"name":"Hot Red 700","value":"#ac120b","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":700}},{"name":"Hot Red 800","value":"#8e140c","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":800}},{"name":"Hot Red 900","value":"#70150c","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":900}}],[{"name":"Hot Orange 50","value":"#fff6e3","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":50}},{"name":"Hot Orange 100","value":"#fce1b5","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":100}},{"name":"Hot Orange 200","value":"#fbca8a","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":200}},{"name":"Hot Orange 300","value":"#fcb161","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":300}},{"name":"Hot Orange 400","value":"#fd953b","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":400}},{"name":"Hot Orange 500","value":"#f67c00","_meta":{"baseColor":true,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":500}},{"name":"Hot Orange 600","value":"#d9650c","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":600}},{"name":"Hot Orange 700","value":"#bb4f10","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":700}},{"name":"Hot Orange 800","value":"#9d3a10","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":800}},{"name":"Hot Orange 900","value":"#7e280e","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":900}}],[{"name":"Hot Yellow 50","value":"#fffbe3","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":50}},{"name":"Hot Yellow 100","value":"#fcf1bd","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":100}},{"name":"Hot Yellow 200","value":"#fbe697","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":200}},{"name":"Hot Yellow 300","value":"#fbda70","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":300}},{"name":"Hot Yellow 400","value":"#fbcd45","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":400}},{"name":"Hot Yellow 500","value":"#f6c200","_meta":{"baseColor":true,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":500}},{"name":"Hot Yellow 600","value":"#daaa12","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":600}},{"name":"Hot Yellow 700","value":"#bd9219","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":700}},{"name":"Hot Yellow 800","value":"#a17b1c","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":800}},{"name":"Hot Yellow 900","value":"#86661e","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":900}}],[{"name":"Hot Green 50","value":"#ecfde6","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":50}},{"name":"Hot Green 100","value":"#c5e6b9","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":100}},{"name":"Hot Green 200","value":"#9dcf8d","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":200}},{"name":"Hot Green 300","value":"#73b961","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":300}},{"name":"Hot Green 400","value":"#44a234","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":400}},{"name":"Hot Green 500","value":"#008a00","_meta":{"baseColor":true,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":500}},{"name":"Hot Green 600","value":"#08720b","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":600}},{"name":"Hot Green 700","value":"#0d5a10","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":700}},{"name":"Hot Green 800","value":"#0f4410","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":800}},{"name":"Hot Green 900","value":"#0f2e0e","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":900}}]]};

/***/ }),

/***/ "./extensions/sketch/generate-color-library.js":
/*!*****************************************************!*\
  !*** ./extensions/sketch/generate-color-library.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* eslint-disable import/no-unresolved */
var _require = __webpack_require__(/*! sketch */ "sketch"),
    getSelectedDocument = _require.getSelectedDocument;

var _require2 = __webpack_require__(/*! sketch/dom */ "sketch/dom"),
    Artboard = _require2.Artboard,
    Rectangle = _require2.Rectangle,
    Shape = _require2.Shape,
    SharedStyle = _require2.SharedStyle,
    Style = _require2.Style,
    SymbolMaster = _require2.SymbolMaster;
/* eslint-enable import/no-unresolved */


var PALETTE = __webpack_require__(/*! ../../dist/colors.json */ "./dist/colors.json");

var SWATCH_WIDTH = 48;
var SWATCH_HEIGHT = 48;
var SWATCH_MARGIN = 12;
var SWATCH_INITIAL_X = 0;
var SWATCH_INITIAL_Y = 0;
/* harmony default export */ __webpack_exports__["default"] = (function () {
  var document = getSelectedDocument();
  var page = document.selectedPage;
  PALETTE.colors.forEach(function (colorObjects, rowIndex) {
    colorObjects.forEach(function (colorObject, columnIndex) {
      var colorStyle = createColorStyle(document, colorObject);
      createColorSymbol(page, colorObject, colorStyle, rowIndex, columnIndex);
    });
  });
});

function createColorStyle(document, colorObject) {
  var name = "Color Fill/".concat(colorObject._meta.baseName, "/").concat(colorObject.name);
  var style = ensureSharedStyle(document, name);
  style.style = {
    type: Style,
    fills: [{
      color: colorObject.value,
      fillType: Style.FillType.Color
    }]
  };
  return style;
}

function ensureSharedStyle(document, name) {
  var style = getSharedStyleByName(document, name);
  return style ? style : SharedStyle.fromStyle({
    document: document,
    name: name,
    style: {
      type: Style
    }
  });
}

function getSharedStyleByName(document, name) {
  var match = null;
  document.getSharedLayerStyles().some(function (style) {
    if (style.name === name) {
      match = style;
      return true;
    }
  });
  return match;
}

function createColorSymbol(parent, colorObject, colorStyle) {
  var rowIndex = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var columnIndex = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var name = "".concat(colorObject._meta.baseName, "/").concat(colorObject.name);
  var x = SWATCH_INITIAL_X + columnIndex * (SWATCH_WIDTH + SWATCH_MARGIN);
  var y = SWATCH_INITIAL_Y + rowIndex * (SWATCH_HEIGHT + SWATCH_MARGIN);
  var colorArtboard = ensureArtboardWith(parent, name, x, y, SWATCH_WIDTH, SWATCH_HEIGHT);
  var colorFill = new Shape({
    parent: empty(colorArtboard),
    name: 'bg',
    frame: new Rectangle(0, 0, SWATCH_WIDTH, SWATCH_HEIGHT),
    sharedStyleId: colorStyle.id
  });
  colorFill.style.syncWithSharedStyle(colorStyle);
  return SymbolMaster.fromArtboard(colorArtboard);
}

function ensureArtboardWith(parent, name, x, y, width, height) {
  var artboard = getArtboardByName(parent, name);

  if (!artboard) {
    return createArtboard(parent, name, x, y, width, height);
  }

  artboard.frame = new Rectangle(x, y, width, height);
  return artboard;
}

function getArtboardByName(parent, name) {
  var match = null;
  parent.layers.some(function (artboard) {
    if (artboard.name === name) {
      match = artboard;
      return true;
    }
  });
  return match;
}

function createArtboard(parent, name, x, y, width, height) {
  return new Artboard({
    parent: parent,
    name: name,
    frame: new Rectangle(x, y, width, height)
  });
}

function empty(parent) {
  if (parent.layers.length >= 0) {
    parent.layers.forEach(function (layer) {
      layer.remove();
    });
  }

  return parent;
}

/***/ }),

/***/ "sketch":
/*!*************************!*\
  !*** external "sketch" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch");

/***/ }),

/***/ "sketch/dom":
/*!*****************************!*\
  !*** external "sketch/dom" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch/dom");

/***/ })

/******/ });
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['onRun'] = __skpm_run.bind(this, 'default')

//# sourceMappingURL=generate-color-library.js.map