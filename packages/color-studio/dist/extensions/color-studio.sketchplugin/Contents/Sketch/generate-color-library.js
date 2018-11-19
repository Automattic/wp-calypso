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

module.exports = {"version":"1.0.0-rc.2","colors":[[{"name":"Gray 0","value":"#f6f6f6","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":0}},{"name":"Gray 50","value":"#e1e2e2","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":50}},{"name":"Gray 100","value":"#ccced0","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":100}},{"name":"Gray 200","value":"#b0b5b8","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":200}},{"name":"Gray 300","value":"#969ca1","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":300}},{"name":"Gray 400","value":"#7c848b","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":400}},{"name":"Gray 500","value":"#636d75","_meta":{"baseColor":true,"baseName":"Gray","colorFormula":"primary","shadeIndex":500}},{"name":"Gray 600","value":"#50575d","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":600}},{"name":"Gray 700","value":"#3d4145","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":700}},{"name":"Gray 800","value":"#2b2d2f","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":800}},{"name":"Gray 900","value":"#1a1a1a","_meta":{"baseColor":false,"baseName":"Gray","colorFormula":"primary","shadeIndex":900}}],[{"name":"Blue 0","value":"#f3f5f6","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":0}},{"name":"Blue 50","value":"#d8dee4","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":50}},{"name":"Blue 100","value":"#bbc9d5","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":100}},{"name":"Blue 200","value":"#95adc1","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":200}},{"name":"Blue 300","value":"#6f93ad","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":300}},{"name":"Blue 400","value":"#46799a","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":400}},{"name":"Blue 500","value":"#016087","_meta":{"baseColor":true,"baseName":"Blue","colorFormula":"primary","shadeIndex":500}},{"name":"Blue 600","value":"#204a69","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":600}},{"name":"Blue 700","value":"#23354b","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":700}},{"name":"Blue 800","value":"#1d232f","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":800}},{"name":"Blue 900","value":"#111215","_meta":{"baseColor":false,"baseName":"Blue","colorFormula":"primary","shadeIndex":900}}],[{"name":"Purple 0","value":"#f7f5f8","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":0}},{"name":"Purple 50","value":"#e5deea","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":50}},{"name":"Purple 100","value":"#d4c8de","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":100}},{"name":"Purple 200","value":"#beabce","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":200}},{"name":"Purple 300","value":"#a88ebe","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":300}},{"name":"Purple 400","value":"#9273af","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":400}},{"name":"Purple 500","value":"#7c589f","_meta":{"baseColor":true,"baseName":"Purple","colorFormula":"primary","shadeIndex":500}},{"name":"Purple 600","value":"#634581","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":600}},{"name":"Purple 700","value":"#4b3264","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":700}},{"name":"Purple 800","value":"#342148","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":800}},{"name":"Purple 900","value":"#1f112e","_meta":{"baseColor":false,"baseName":"Purple","colorFormula":"primary","shadeIndex":900}}],[{"name":"Pink 0","value":"#fbf4f7","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":0}},{"name":"Pink 50","value":"#f2dee6","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":50}},{"name":"Pink 100","value":"#ebc6d5","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":100}},{"name":"Pink 200","value":"#e1a7bf","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":200}},{"name":"Pink 300","value":"#d688aa","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":300}},{"name":"Pink 400","value":"#c96895","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":400}},{"name":"Pink 500","value":"#bc4681","_meta":{"baseColor":true,"baseName":"Pink","colorFormula":"primary","shadeIndex":500}},{"name":"Pink 600","value":"#9b3c69","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":600}},{"name":"Pink 700","value":"#7b3252","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":700}},{"name":"Pink 800","value":"#5d283d","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":800}},{"name":"Pink 900","value":"#3f1f2a","_meta":{"baseColor":false,"baseName":"Pink","colorFormula":"primary","shadeIndex":900}}],[{"name":"Red 0","value":"#fdf3f1","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":0}},{"name":"Red 50","value":"#fadad3","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":50}},{"name":"Red 100","value":"#f8bfb4","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":100}},{"name":"Red 200","value":"#f19d8d","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":200}},{"name":"Red 300","value":"#e77a68","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":300}},{"name":"Red 400","value":"#da5544","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":400}},{"name":"Red 500","value":"#ca2622","_meta":{"baseColor":true,"baseName":"Red","colorFormula":"primary","shadeIndex":500}},{"name":"Red 600","value":"#a82620","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":600}},{"name":"Red 700","value":"#87241d","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":700}},{"name":"Red 800","value":"#68211a","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":800}},{"name":"Red 900","value":"#491d17","_meta":{"baseColor":false,"baseName":"Red","colorFormula":"primary","shadeIndex":900}}],[{"name":"Orange 0","value":"#fef7f2","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":0}},{"name":"Orange 50","value":"#fce4d5","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":50}},{"name":"Orange 100","value":"#fad2b6","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":100}},{"name":"Orange 200","value":"#f5ba8f","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":200}},{"name":"Orange 300","value":"#eda268","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":300}},{"name":"Orange 400","value":"#e38a40","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":400}},{"name":"Orange 500","value":"#d7730f","_meta":{"baseColor":true,"baseName":"Orange","colorFormula":"primary","shadeIndex":500}},{"name":"Orange 600","value":"#b95e1b","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":600}},{"name":"Orange 700","value":"#994b1f","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":700}},{"name":"Orange 800","value":"#79391f","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":800}},{"name":"Orange 900","value":"#592a1b","_meta":{"baseColor":false,"baseName":"Orange","colorFormula":"primary","shadeIndex":900}}],[{"name":"Yellow 0","value":"#fdfaf4","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":0}},{"name":"Yellow 50","value":"#faf0db","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":50}},{"name":"Yellow 100","value":"#f7e5c0","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":100}},{"name":"Yellow 200","value":"#f1d79d","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":200}},{"name":"Yellow 300","value":"#e9ca7a","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":300}},{"name":"Yellow 400","value":"#e0bd56","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":400}},{"name":"Yellow 500","value":"#d6b02c","_meta":{"baseColor":true,"baseName":"Yellow","colorFormula":"primary","shadeIndex":500}},{"name":"Yellow 600","value":"#ba9830","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":600}},{"name":"Yellow 700","value":"#9e8132","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":700}},{"name":"Yellow 800","value":"#826b32","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":800}},{"name":"Yellow 900","value":"#675631","_meta":{"baseColor":false,"baseName":"Yellow","colorFormula":"primary","shadeIndex":900}}],[{"name":"Green 0","value":"#f3f6f1","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":0}},{"name":"Green 50","value":"#d8e4d4","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":50}},{"name":"Green 100","value":"#bcd3b5","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":100}},{"name":"Green 200","value":"#97bc8d","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":200}},{"name":"Green 300","value":"#73a567","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":300}},{"name":"Green 400","value":"#4d8e41","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":400}},{"name":"Green 500","value":"#1d7819","_meta":{"baseColor":true,"baseName":"Green","colorFormula":"primary","shadeIndex":500}},{"name":"Green 600","value":"#1e611e","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":600}},{"name":"Green 700","value":"#1e4a1e","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":700}},{"name":"Green 800","value":"#1d341d","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":800}},{"name":"Green 900","value":"#192019","_meta":{"baseColor":false,"baseName":"Green","colorFormula":"primary","shadeIndex":900}}],[{"name":"Celadon 0","value":"#f3f6f5","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":0}},{"name":"Celadon 50","value":"#d8e3e0","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":50}},{"name":"Celadon 100","value":"#bad1cb","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":100}},{"name":"Celadon 200","value":"#93bab0","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":200}},{"name":"Celadon 300","value":"#6da296","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":300}},{"name":"Celadon 400","value":"#438c7d","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":400}},{"name":"Celadon 500","value":"#007565","_meta":{"baseColor":true,"baseName":"Celadon","colorFormula":"primary","shadeIndex":500}},{"name":"Celadon 600","value":"#195d52","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":600}},{"name":"Celadon 700","value":"#20473f","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":700}},{"name":"Celadon 800","value":"#20312d","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":800}},{"name":"Celadon 900","value":"#1d1d1d","_meta":{"baseColor":false,"baseName":"Celadon","colorFormula":"primary","shadeIndex":900}}],[{"name":"Hot Blue 0","value":"#f5f9ff","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":0}},{"name":"Hot Blue 50","value":"#dbe8ff","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":50}},{"name":"Hot Blue 100","value":"#c1d7ff","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":100}},{"name":"Hot Blue 200","value":"#93b6ff","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":200}},{"name":"Hot Blue 300","value":"#6795fe","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":300}},{"name":"Hot Blue 400","value":"#3574f8","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":400}},{"name":"Hot Blue 500","value":"#005fb7","_meta":{"baseColor":true,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":500}},{"name":"Hot Blue 600","value":"#144b9b","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":600}},{"name":"Hot Blue 700","value":"#183780","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":700}},{"name":"Hot Blue 800","value":"#162566","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":800}},{"name":"Hot Blue 900","value":"#10144d","_meta":{"baseColor":false,"baseName":"Hot Blue","colorFormula":"secondary","shadeIndex":900}}],[{"name":"Hot Pink 0","value":"#fff4fc","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":0}},{"name":"Hot Pink 50","value":"#ffdff3","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":50}},{"name":"Hot Pink 100","value":"#ffcaea","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":100}},{"name":"Hot Pink 200","value":"#ffa2d4","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":200}},{"name":"Hot Pink 300","value":"#ff76b8","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":300}},{"name":"Hot Pink 400","value":"#ff3997","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":400}},{"name":"Hot Pink 500","value":"#d52c82","_meta":{"baseColor":true,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":500}},{"name":"Hot Pink 600","value":"#b7266a","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":600}},{"name":"Hot Pink 700","value":"#992053","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":700}},{"name":"Hot Pink 800","value":"#7c1b40","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":800}},{"name":"Hot Pink 900","value":"#60162e","_meta":{"baseColor":false,"baseName":"Hot Pink","colorFormula":"secondary","shadeIndex":900}}],[{"name":"Hot Red 0","value":"#fff5ed","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":0}},{"name":"Hot Red 50","value":"#ffe2cd","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":50}},{"name":"Hot Red 100","value":"#ffcfac","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":100}},{"name":"Hot Red 200","value":"#ffab78","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":200}},{"name":"Hot Red 300","value":"#ff8248","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":300}},{"name":"Hot Red 400","value":"#ff4b1c","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":400}},{"name":"Hot Red 500","value":"#eb0001","_meta":{"baseColor":true,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":500}},{"name":"Hot Red 600","value":"#cb0c07","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":600}},{"name":"Hot Red 700","value":"#ac120b","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":700}},{"name":"Hot Red 800","value":"#8e140c","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":800}},{"name":"Hot Red 900","value":"#70150c","_meta":{"baseColor":false,"baseName":"Hot Red","colorFormula":"secondary","shadeIndex":900}}],[{"name":"Hot Orange 0","value":"#fff9eb","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":0}},{"name":"Hot Orange 50","value":"#feedcf","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":50}},{"name":"Hot Orange 100","value":"#fce1b5","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":100}},{"name":"Hot Orange 200","value":"#fbca8a","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":200}},{"name":"Hot Orange 300","value":"#fcb161","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":300}},{"name":"Hot Orange 400","value":"#fd953b","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":400}},{"name":"Hot Orange 500","value":"#f67c00","_meta":{"baseColor":true,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":500}},{"name":"Hot Orange 600","value":"#d9650c","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":600}},{"name":"Hot Orange 700","value":"#bb4f10","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":700}},{"name":"Hot Orange 800","value":"#9d3a10","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":800}},{"name":"Hot Orange 900","value":"#7e280e","_meta":{"baseColor":false,"baseName":"Hot Orange","colorFormula":"secondary","shadeIndex":900}}],[{"name":"Hot Yellow 0","value":"#fffdeb","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":0}},{"name":"Hot Yellow 50","value":"#fef7d2","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":50}},{"name":"Hot Yellow 100","value":"#fcf1bd","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":100}},{"name":"Hot Yellow 200","value":"#fbe697","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":200}},{"name":"Hot Yellow 300","value":"#fbda70","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":300}},{"name":"Hot Yellow 400","value":"#fbcd45","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":400}},{"name":"Hot Yellow 500","value":"#f6c200","_meta":{"baseColor":true,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":500}},{"name":"Hot Yellow 600","value":"#daaa12","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":600}},{"name":"Hot Yellow 700","value":"#bd9219","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":700}},{"name":"Hot Yellow 800","value":"#a17b1c","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":800}},{"name":"Hot Yellow 900","value":"#86661e","_meta":{"baseColor":false,"baseName":"Hot Yellow","colorFormula":"secondary","shadeIndex":900}}],[{"name":"Hot Green 0","value":"#f2fdee","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":0}},{"name":"Hot Green 50","value":"#daf2d1","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":50}},{"name":"Hot Green 100","value":"#c5e6b9","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":100}},{"name":"Hot Green 200","value":"#9dcf8d","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":200}},{"name":"Hot Green 300","value":"#73b961","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":300}},{"name":"Hot Green 400","value":"#44a234","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":400}},{"name":"Hot Green 500","value":"#008a00","_meta":{"baseColor":true,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":500}},{"name":"Hot Green 600","value":"#08720b","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":600}},{"name":"Hot Green 700","value":"#0d5a10","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":700}},{"name":"Hot Green 800","value":"#0f4410","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":800}},{"name":"Hot Green 900","value":"#0f2e0e","_meta":{"baseColor":false,"baseName":"Hot Green","colorFormula":"secondary","shadeIndex":900}}]]};

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


var padStart = __webpack_require__(/*! lodash/padStart */ "./node_modules/lodash/padStart.js");

var PALETTE = __webpack_require__(/*! ../../dist/colors.json */ "./dist/colors.json");

var SWATCH_WIDTH = 48;
var SWATCH_HEIGHT = 48;
var SWATCH_MARGIN = 12;
var SWATCH_INITIAL_X = 0;
var SWATCH_INITIAL_Y = 240;
var PALETTE_WHITE = {
  name: 'White',
  value: '#ffffff',
  _meta: {
    special: true
  }
};
var PALETTE_COLORS = [[PALETTE_WHITE]].concat(PALETTE.colors);
var cachedArtboards = {};
var cachedSharedStyles = {};
/* harmony default export */ __webpack_exports__["default"] = (function () {
  var document = getSelectedDocument();
  var page = document.selectedPage;
  cacheArtboards(page);
  cacheSharedStyles(document);
  PALETTE_COLORS.forEach(function (colorObjects, rowIndex) {
    colorObjects.forEach(function (colorObject, columnIndex) {
      var colorStyle = createColorStyle(document, colorObject);
      createColorSymbol(page, colorObject, colorStyle, rowIndex, columnIndex);
    });
  });
});

function cacheArtboards(parent) {
  parent.layers.forEach(function (artboard) {
    cachedArtboards[artboard.name] = artboard;
  });
}

function cacheSharedStyles(document) {
  document.getSharedLayerStyles().forEach(function (style) {
    cachedSharedStyles[style.name] = style;
  });
}

function createColorStyle(document, colorObject) {
  var name = normalizeColorName(colorObject);
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

function normalizeColorName(colorObject) {
  if (colorObject._meta.special) {
    return colorObject.name;
  }

  var base = colorObject._meta.baseName;
  var index = padStart(colorObject._meta.shadeIndex, 3, 0);
  return "".concat(base, "/").concat(base, " ").concat(index);
}

function ensureSharedStyle(document, name) {
  return cachedSharedStyles[name] || SharedStyle.fromStyle({
    document: document,
    name: name,
    style: {
      type: Style
    }
  });
}

function createColorSymbol(parent, colorObject, colorStyle) {
  var rowIndex = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var columnIndex = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var name = normalizeColorName(colorObject);
  var x = SWATCH_INITIAL_X + columnIndex * (SWATCH_WIDTH + SWATCH_MARGIN);
  var y = SWATCH_INITIAL_Y + rowIndex * (SWATCH_HEIGHT + SWATCH_MARGIN);
  var colorArtboard = ensureArtboardWith(parent, name, x, y, SWATCH_WIDTH, SWATCH_HEIGHT);
  var colorFill = new Shape({
    parent: empty(colorArtboard),
    name: 'bg',
    frame: new Rectangle(0, 0, SWATCH_WIDTH, SWATCH_HEIGHT),
    sharedStyleId: colorStyle.id,
    locked: true
  });
  colorFill.style.syncWithSharedStyle(colorStyle);
  return SymbolMaster.fromArtboard(colorArtboard);
}

function ensureArtboardWith(parent, name, x, y, width, height) {
  var artboard = cachedArtboards[name] || new Artboard({
    parent: parent,
    name: name
  });
  artboard.frame = new Rectangle(x, y, width, height);
  return artboard;
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

/***/ "./node_modules/@skpm/builder/node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./node_modules/lodash/_Symbol.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/_Symbol.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),

/***/ "./node_modules/lodash/_arrayMap.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_arrayMap.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;


/***/ }),

/***/ "./node_modules/lodash/_asciiSize.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_asciiSize.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseProperty = __webpack_require__(/*! ./_baseProperty */ "./node_modules/lodash/_baseProperty.js");

/**
 * Gets the size of an ASCII `string`.
 *
 * @private
 * @param {string} string The string inspect.
 * @returns {number} Returns the string size.
 */
var asciiSize = baseProperty('length');

module.exports = asciiSize;


/***/ }),

/***/ "./node_modules/lodash/_asciiToArray.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_asciiToArray.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

module.exports = asciiToArray;


/***/ }),

/***/ "./node_modules/lodash/_baseGetTag.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseGetTag.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    getRawTag = __webpack_require__(/*! ./_getRawTag */ "./node_modules/lodash/_getRawTag.js"),
    objectToString = __webpack_require__(/*! ./_objectToString */ "./node_modules/lodash/_objectToString.js");

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),

/***/ "./node_modules/lodash/_baseProperty.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseProperty.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;


/***/ }),

/***/ "./node_modules/lodash/_baseRepeat.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseRepeat.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeFloor = Math.floor;

/**
 * The base implementation of `_.repeat` which doesn't coerce arguments.
 *
 * @private
 * @param {string} string The string to repeat.
 * @param {number} n The number of times to repeat the string.
 * @returns {string} Returns the repeated string.
 */
function baseRepeat(string, n) {
  var result = '';
  if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
    return result;
  }
  // Leverage the exponentiation by squaring algorithm for a faster repeat.
  // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
  do {
    if (n % 2) {
      result += string;
    }
    n = nativeFloor(n / 2);
    if (n) {
      string += string;
    }
  } while (n);

  return result;
}

module.exports = baseRepeat;


/***/ }),

/***/ "./node_modules/lodash/_baseSlice.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseSlice.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

module.exports = baseSlice;


/***/ }),

/***/ "./node_modules/lodash/_baseToString.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseToString.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    arrayMap = __webpack_require__(/*! ./_arrayMap */ "./node_modules/lodash/_arrayMap.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;


/***/ }),

/***/ "./node_modules/lodash/_castSlice.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_castSlice.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseSlice = __webpack_require__(/*! ./_baseSlice */ "./node_modules/lodash/_baseSlice.js");

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}

module.exports = castSlice;


/***/ }),

/***/ "./node_modules/lodash/_createPadding.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_createPadding.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseRepeat = __webpack_require__(/*! ./_baseRepeat */ "./node_modules/lodash/_baseRepeat.js"),
    baseToString = __webpack_require__(/*! ./_baseToString */ "./node_modules/lodash/_baseToString.js"),
    castSlice = __webpack_require__(/*! ./_castSlice */ "./node_modules/lodash/_castSlice.js"),
    hasUnicode = __webpack_require__(/*! ./_hasUnicode */ "./node_modules/lodash/_hasUnicode.js"),
    stringSize = __webpack_require__(/*! ./_stringSize */ "./node_modules/lodash/_stringSize.js"),
    stringToArray = __webpack_require__(/*! ./_stringToArray */ "./node_modules/lodash/_stringToArray.js");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeCeil = Math.ceil;

/**
 * Creates the padding for `string` based on `length`. The `chars` string
 * is truncated if the number of characters exceeds `length`.
 *
 * @private
 * @param {number} length The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padding for `string`.
 */
function createPadding(length, chars) {
  chars = chars === undefined ? ' ' : baseToString(chars);

  var charsLength = chars.length;
  if (charsLength < 2) {
    return charsLength ? baseRepeat(chars, length) : chars;
  }
  var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
  return hasUnicode(chars)
    ? castSlice(stringToArray(result), 0, length).join('')
    : result.slice(0, length);
}

module.exports = createPadding;


/***/ }),

/***/ "./node_modules/lodash/_freeGlobal.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_freeGlobal.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../@skpm/builder/node_modules/webpack/buildin/global.js */ "./node_modules/@skpm/builder/node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/lodash/_getRawTag.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_getRawTag.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),

/***/ "./node_modules/lodash/_hasUnicode.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_hasUnicode.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

module.exports = hasUnicode;


/***/ }),

/***/ "./node_modules/lodash/_objectToString.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_objectToString.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),

/***/ "./node_modules/lodash/_root.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/_root.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),

/***/ "./node_modules/lodash/_stringSize.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_stringSize.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var asciiSize = __webpack_require__(/*! ./_asciiSize */ "./node_modules/lodash/_asciiSize.js"),
    hasUnicode = __webpack_require__(/*! ./_hasUnicode */ "./node_modules/lodash/_hasUnicode.js"),
    unicodeSize = __webpack_require__(/*! ./_unicodeSize */ "./node_modules/lodash/_unicodeSize.js");

/**
 * Gets the number of symbols in `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the string size.
 */
function stringSize(string) {
  return hasUnicode(string)
    ? unicodeSize(string)
    : asciiSize(string);
}

module.exports = stringSize;


/***/ }),

/***/ "./node_modules/lodash/_stringToArray.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_stringToArray.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var asciiToArray = __webpack_require__(/*! ./_asciiToArray */ "./node_modules/lodash/_asciiToArray.js"),
    hasUnicode = __webpack_require__(/*! ./_hasUnicode */ "./node_modules/lodash/_hasUnicode.js"),
    unicodeToArray = __webpack_require__(/*! ./_unicodeToArray */ "./node_modules/lodash/_unicodeToArray.js");

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

module.exports = stringToArray;


/***/ }),

/***/ "./node_modules/lodash/_unicodeSize.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_unicodeSize.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']',
    rsCombo = '[' + rsComboRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Gets the size of a Unicode `string`.
 *
 * @private
 * @param {string} string The string inspect.
 * @returns {number} Returns the string size.
 */
function unicodeSize(string) {
  var result = reUnicode.lastIndex = 0;
  while (reUnicode.test(string)) {
    ++result;
  }
  return result;
}

module.exports = unicodeSize;


/***/ }),

/***/ "./node_modules/lodash/_unicodeToArray.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_unicodeToArray.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']',
    rsCombo = '[' + rsComboRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

module.exports = unicodeToArray;


/***/ }),

/***/ "./node_modules/lodash/isArray.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/isArray.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),

/***/ "./node_modules/lodash/isObject.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isObject.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),

/***/ "./node_modules/lodash/isObjectLike.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/isObjectLike.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),

/***/ "./node_modules/lodash/isSymbol.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isSymbol.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;


/***/ }),

/***/ "./node_modules/lodash/padStart.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/padStart.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var createPadding = __webpack_require__(/*! ./_createPadding */ "./node_modules/lodash/_createPadding.js"),
    stringSize = __webpack_require__(/*! ./_stringSize */ "./node_modules/lodash/_stringSize.js"),
    toInteger = __webpack_require__(/*! ./toInteger */ "./node_modules/lodash/toInteger.js"),
    toString = __webpack_require__(/*! ./toString */ "./node_modules/lodash/toString.js");

/**
 * Pads `string` on the left side if it's shorter than `length`. Padding
 * characters are truncated if they exceed `length`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to pad.
 * @param {number} [length=0] The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padded string.
 * @example
 *
 * _.padStart('abc', 6);
 * // => '   abc'
 *
 * _.padStart('abc', 6, '_-');
 * // => '_-_abc'
 *
 * _.padStart('abc', 3);
 * // => 'abc'
 */
function padStart(string, length, chars) {
  string = toString(string);
  length = toInteger(length);

  var strLength = length ? stringSize(string) : 0;
  return (length && strLength < length)
    ? (createPadding(length - strLength, chars) + string)
    : string;
}

module.exports = padStart;


/***/ }),

/***/ "./node_modules/lodash/toFinite.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/toFinite.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toNumber = __webpack_require__(/*! ./toNumber */ "./node_modules/lodash/toNumber.js");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308;

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

module.exports = toFinite;


/***/ }),

/***/ "./node_modules/lodash/toInteger.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/toInteger.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toFinite = __webpack_require__(/*! ./toFinite */ "./node_modules/lodash/toFinite.js");

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

module.exports = toInteger;


/***/ }),

/***/ "./node_modules/lodash/toNumber.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/toNumber.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = toNumber;


/***/ }),

/***/ "./node_modules/lodash/toString.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/toString.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseToString = __webpack_require__(/*! ./_baseToString */ "./node_modules/lodash/_baseToString.js");

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;


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