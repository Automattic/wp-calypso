# @wordpress/hooks

A lightweight & efficient EventManager for JavaScript.

## Installation

Install the module

```bash
npm install @wordpress/hooks --save
```

### Usage
In your JavaScript project, use hooks as follows:
```javascript
import { createHooks } from '@wordpress/hooks';

myObject.hooks = createHooks();
myObject.hooks.addAction(); //etc...
```

In the WordPress context, API functions can be called via the global `wp.hooks` like this `wp.hooks.addAction()`, etc.

### API Usage

* `createHooks()`
* `addAction( 'hookName', 'functionName', callback, priority )`
* `addFilter( 'hookName', 'functionName', callback, priority )`
* `removeAction( 'hookName', 'functionName' )`
* `removeFilter( 'hookName', 'functionName' )`
* `removeAllActions( 'hookName' )`
* `removeAllFilters( 'hookName' )`
* `doAction( 'hookName', arg1, arg2, moreArgs, finalArg )`
* `applyFilters( 'hookName', content, arg1, arg2, moreArgs, finalArg )`
* `doingAction( 'hookName' )`
* `doingFilter( 'hookName' )`
* `didAction( 'hookName' )`
* `didFilter( 'hookName' )`
* `hasAction( 'hookName' )`
* `hasFilter( 'hookName' )`
* `actions`
* `filters`


### Events on action/filter add or remove

Whenever an action or filter is added or removed, a matching `hookAdded` or `hookRemoved` action is triggered.

* `hookAdded` action is triggered when `addFilter()` or `addAction()` method is called, passing values for `hookName`, `functionName`, `callback` and `priority`.
* `hookRemoved` action is triggered when `removeFilter()` or `removeAction()` method is called, passing values for `hookName` and `functionName`.

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
