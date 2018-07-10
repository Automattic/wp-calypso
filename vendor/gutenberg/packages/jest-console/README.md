# @wordpress/jest-console

Custom [Jest](http://facebook.github.io/jest/) matchers for the [Console](https://developer.mozilla.org/en-US/docs/Web/API/Console)
object to test JavaScript code in WordPress.

This package converts `console.error`, `console.info`, `console.log` and `console.warn` functions into mocks and tracks their calls.
It also enforces usage of one of the related matchers whenever tested code calls one of the mentioned `console` methods.
It means that you need to assert with `.toHaveErrored()` or `.toHaveErroredWith( arg1, arg2, ... )` when `console.error`
gets executed, and use the corresponding methods when `console.info`, `console.log` or `console.warn` are called.
Your test will fail otherwise! This is a conscious design decision which helps to detect deprecation warnings when
upgrading dependent libraries or smaller errors when refactoring code.

## Installation

Install the module:

```bash
npm install @wordpress/jest-console --save-dev
```

### Setup

The simplest setup is to use Jest's `setupTestFrameworkScriptFile` config option:

```js
"jest": {
  "setupTestFrameworkScriptFile": "./node_modules/@wordpress/jest-console/build/index.js"
},
```

If your project already has a script file which sets up the test framework, you will need the following import statement:

```js
import '@wordpress/jest-console';
```

### Usage

### `.toHaveErrored()`

Use `.toHaveErrored` to ensure that `console.error` function was called.

For example, let's say you have a `drinkAll( flavor )` function that makes you drink all available beverages.
You might want to check if function calls `console.error` for `'octopus'` instead, because `'octopus'` flavor is really
weird and why would anything be octopus-flavored? You can do that with this test suite:

```js
describe( 'drinkAll', () => {
  test( 'drinks something lemon-flavored', () => {
    drinkAll( 'lemon' );
    expect( console ).not.toHaveErrored();
  } );

  test( 'errors when something is octopus-flavored', () => {
    drinkAll( 'octopus' );
    expect( console ).toHaveErrored();
  } );
} );
```

### `.toHaveErroredWith( arg1, arg2, ... )`

Use `.toHaveErroredWith` to ensure that `console.error` function was called with
specific arguments.

For example, let's say you have a `drinkAll( flavor )` function again makes you drink all available beverages.
You might want to check if function calls `console.error` with a specific message for `'octopus'` instead, because
`'octopus'` flavor is really weird and why would anything be octopus-flavored? To make sure this works, you could write:

```js
describe( 'drinkAll', () => {
  test( 'errors with message when something is octopus-flavored', () => {
    drinkAll( 'octopus' );
    expect( console ).toHaveErroredWith( 'Should I really drink something that is octopus-flavored?' );
  } );
} );
```

### `.toHaveInformed()`

Use `.toHaveInformed` to ensure that `console.info` function was called.

Almost identical usage as `.toHaveErrored()`.

### `.toHaveInformedWith( arg1, arg2, ... )`

Use `.toHaveInformedWith` to ensure that `console.info` function was called with
specific arguments.

Almost identical usage as `.toHaveErroredWith()`.

### `.toHaveLogged()`

Use `.toHaveLogged` to ensure that `console.log` function was called.

Almost identical usage as `.toHaveErrored()`.

### `.toHaveLoggedWith( arg1, arg2, ... )`

Use `.toHaveLoggedWith` to ensure that `console.log` function was called with
specific arguments.

Almost identical usage as `.toHaveErroredWith()`.

### `.toHaveWarned()`

Use `.toHaveWarned` to ensure that `console.warn` function was called.

Almost identical usage as `.toHaveErrored()`.

### `.toHaveWarnedWith( arg1, arg2, ... )`

Use `.toHaveWarneddWith` to ensure that `console.warn` function was called with
specific arguments.

Almost identical usage as `.toHaveErroredWith()`.

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
