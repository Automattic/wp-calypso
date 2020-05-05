JavaScript Coding Guidelines
===========================

## Spacing

Use spacing liberally throughout your code. “When in doubt, space it out.”

These rules encourage liberal spacing for improved developer readability. The minification process creates a file that is optimized for browsers to read and process.

- Indentation with tabs.
- No whitespace at the end of line or on blank lines.
- Lines should usually be no longer than 80 characters, and should not exceed 100 (counting tabs as 4 spaces). This is a “soft” rule, but long lines generally indicate unreadable or disorganized code.
- if/else/for/while/try blocks should always use braces, and always go on multiple lines.
- Unary special-character operators (e.g., ++, --) must not have space next to their operand.
- Any `,` and `;` must not have preceding space.
- Any `;` used as a statement terminator must be at the end of the line.
- Any `:` after a property name in an object definition must not have preceding space.
- The `?` and `:` in a ternary conditional must have space on both sides.
- No filler spaces in empty constructs (e.g., `{}`, `[]`, `fn()`).
- There should be a new line at the end of each file.
- Any `!` negation operator should have a following space
- All function bodies are indented by one tab, even if the entire file is wrapped in a closure
- Spaces may align code within documentation blocks or within a line, but only tabs should be used at the start of a line

Don't forget to [remove trailing whitespace](trailing-whitespace.md).

We specify an [EditorConfig](http://editorconfig.org/) configuration and encourage you to install a plugin for your editor to simplify following many of our spacing guidelines.

## Objects

Object declarations can be made on a single line if they are short (remember the line length guidelines). When an object declaration is too long to fit on one line, there must be one property per line. Property names only need to be quoted if they are reserved words or contain special characters:

```js
// Bad
const labels = { facebook: 'Facebook',
	twitter: 'Twitter', 'google-plus': 'Google Plus' };
```
```js
// Acceptable for small objects
const labels = { 'google-plus': 'Google Plus' };
```
```js
// Good
const labels = {
	facebook: 'Facebook',
	twitter: 'Twitter',
	'google-plus': 'Google Plus'
};
```

## Arrays and Function Calls

Always include extra spaces around elements and arguments:

```js
const array = [ a, b ];

foo( arg );

foo( 'string', object );

foo( options, object[ property ] );

foo( node, 'property', 2 );

// Unlike the WordPress core standards, we always add a single space
// around object literals and callbacks.
foo( {
	a: 'alpha',
	b: 'beta'
} );

foo( data, () => {
	// Do stuff
} );
```

## Examples of Good Spacing

```js
if ( condition ) {
	doSomething( 'with a string' );
} else if ( otherCondition ) {
	otherThing( {
		key: value,
		otherKey: otherValue
	} );
} else {
	somethingElse( true );
}

while ( ! condition ) {
	iterating++;
}

for ( let i = 0; i < 100; i++ ) {
	object[ array[ i ] ] = someFn( i );
}

try {
	// Expressions
} catch ( e ) {
	// Expressions
}
```

## Semicolons

Use them. Never rely on [Automatic Semicolon Insertion (ASI)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Automatic_semicolon_insertion).

## Indentation and Line Breaks

Indentation and line breaks add readability to complex statements.

Tabs should be used for indentation.

Try to return early from a function to avoid functions with deep indentation akin to ["Callback Hell"](http://callbackhell.com/).

```js
// Bad
function isFreshData( data ) {
	let isFresh;
	if ( data ) {
		if ( data.timestamp > Date.now() - ( 20 * 60 * 1000 ) ) {
			isFresh = true;
		} else {
			isFresh = false;
		}
	} else {
		isFresh = false;
	}

	return isFresh;
}
```
```js
// Good
function isFreshData( data ) {
	if ( data && data.timestamp > Date.now() - ( 20 * 60 * 1000 ) ) {
		return true;
	}

	return false;
}
```

## Blocks and Curly Braces

`if`, `else`, `for`, `while`, and `try` blocks should always use braces, and always go on multiple lines. The opening brace should be on the same line as the function definition, the conditional, or the loop. The closing brace should be on the line directly following the last statement of the block.

```js
if ( isLarge() ) {
	// Expressions
} else if ( isMedium() ) {
	// Expressions
} else {
	// Expressions
}
```

When all paths of a set of `if` or `else if` statements `return` a value, do not include an `else` block.

```js
// Bad
function getStatusLabel() {
	if ( isValid() ) {
		return 'OK';
	} else {
		return 'Not OK';
	}
}

// Good
function getStatusLabel() {
	if ( isValid() ) {
		return 'OK';
	}

	return 'Not OK';
}
```

## Multi-line Statements

When a statement is too long to fit on one line, line breaks must occur after an operator.

```js
// Bad
const sumLabel = 'The sum of ' + a + ' and ' + b + ' plus ' + c
	+ ' is ' + ( a + b + c );
```
```js
// Good
const sumLabel = 'The sum of ' + a + ' and ' + b + ' plus ' + c +
	' is ' + ( a + b + c );
```

When a conditional is too long to fit on one line, successive lines should be indented one extra level to distinguish them from the body.

```js
if ( firstCondition() && secondCondition() &&
		thirdCondition() ) {
	doStuff();
}
```


## Assignments and Globals

### Variable Declarations

When possible, variables should be declared using a `const` declaration. Use 
`let` only when you anticipate that the variable value will be reassigned 
during runtime. `var` should not be used in any new code.

Note that `const` does not protect against mutations to an object, so do not
use it as an indicator of immutability.

```javascript
const foo = {};
foo.bar = true;

let counter = 0;
counter++;
```

### Globals

Globals should almost never be used. If they are used or you need to reference a pre-existing global do so via `window`.

```js
let userId;
if ( typeof window !== 'undefined' ) {
	userId = get( window, 'currentUser.ID' );
}
```

Note that because parts of our application are [rendered on the server](https://github.com/Automattic/wp-calypso/blob/master/docs/server-side-rendering.md), we cannot always assume that a `window` global is present. Therefore, if you must reference a `window` global, always perform a `typeof` check to verify that it exists.

## Naming Conventions

Variable and function names should be full words, using camel case with a lowercase first letter. This also applies to abbreviations and acronyms.

```js
// Bad
let userIDToDelete;
let siteURL;
```
```js
// Good
let userIdToDelete;
let siteUrl;
```

Names should be descriptive, but not excessively so. Exceptions are allowed for iterators, such as the use of `i` to represent the index in a loop.

Constructors intended for use with new should have a capital first letter (UpperCamelCase).

Variables intended to be used as a [constant](https://en.wikipedia.org/wiki/Constant_(computer_programming)) can be defined with the [SCREAMING_SNAKE_CASE naming convention](https://en.wikipedia.org/wiki/Snake_case). Note that while any variable declared using `const` could be considered a constant, in the context of our application this usage should usually be limited to top-level or exported module values.

```js
const DUMMY_VALUE = 10;

function getIncrementedDummyValue() {
	const incrementedValue = DUMMY_VALUE + 1;
	return incrementedValue;
}
```

## Comments

Comments come before the code to which they refer, and should always be preceded by a blank line unless inserted as the first line in a block statement. Capitalize the first letter of the comment, and include a period at the end when writing full sentences. There must be a single space between the comment token (//) and the comment text.

Single line comments:

```js
someStatement();

// Explanation of something complex on the next line
Array.prototype.forEach.call( document.querySelectorAll( 'p' ), doSomething );
```

When adding documentation, use the [jsdoc](http://usejsdoc.org/) format.

```js
/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */
function Book( title, author ) {

}

```

Multi-line comments that are not a jsdoc comment should use `//`:

```js
// This is a comment that is long enough to warrant being stretched
// over the span of multiple lines.
```

## Equality

Strict equality checks (===) must be used in favor of abstract equality checks (==). The only exception is when checking for both undefined and null by way of null, though it is preferable to use Lodash's [`isNil`](https://lodash.com/docs#isNil) for this purpose.

```js
// Check that 'someValue' is either undefined or null, for some important reason.

// Good
if ( someValue == null ) {
	...
}

// better
if ( isNil( someValue ) ) {
	...
}
```

## Type Checks

When checking the type of a value, use one of the following utilities from [Lodash](https://lodash.com/):
These are the preferred ways of checking the type of a value:

- String: [`isString( value )`](https://lodash.com/docs#isString)
- Number: [`isNumber( value )`](https://lodash.com/docs#isNumber)
- Boolean: [`isBoolean( value )`](https://lodash.com/docs#isBoolean)
- Object: [`isPlainObject( value )`](https://lodash.com/docs#isPlainObject)
- null: [`isNull( value )`](https://lodash.com/docs#isNull)
- undefined: [`isUndefined( value )`](https://lodash.com/docs#isUndefined)
- undefined or null (either): [`isNil( value )`](https://lodash.com/docs#isNil)

As mentioned earlier, you should avoid referencing global values without first validating their presence.
Calling `isUndefined( someGlobalValue )` would throw a `ReferenceError` if that value doesn't exist.
Instead, fall back to checking with `typeof window !== 'undefined'` for global values.

Note that we don't recommend using [`isObject`](https://lodash.com/docs#isObject) to check that a value is an object. This is because non-plain-object types (arrays, regexes and others) test as true for this check.

Though these are the recommended type checks, you generally don't have to know the type of an object. Instead, prefer testing the object's existence and shape over its type.

## Existence and Shape Checks

Prefer using the [power of "truthy"](http://www.ecma-international.org/ecma-262/6.0/#sec-toboolean)
in JavaScript boolean expressions to validate the existence and shape of an 
object to using `typeof`.

The following are all false in boolean expressions:

- `null`
- `undefined`
- `''` the empty string
- `0` the number

But be careful, because these are all true:

- `'0'` the string
- `[]` the empty array
- `{}` the empty object
- `-1` the number


To test the existence of an object (including arrays):
```js
if ( object ) { ... }
```

To test if a property exists on an object, regardless of value, including `undefined` or other falsey values:
```js
// Good:
if ( 'desired' in object ) { ... }

// Better, using Lodash's `has` function:
if ( has( object, 'desired' ) ) { ... }
```

To test if a property is present and has a truthy value:
```js
if ( object.desired ) { ... }
```

To test if an object exists and has a property:
```js
// Good:
if ( object && 'desired' in object ) { ... }
if ( object && object.desired ) { ... }

// Better, using Lodash's `has` function:
if ( has( object, 'desired' ) ) { ... }

// Note: 'has' will safely return `false` if a value is missing at any point in the nesting.
// Even if the chain breaks at 'b' 'has' will return false, rather than throwing an error.
if ( has( object, 'a.b.c.desired' ) ) { ... }
```

Note that the `in` operator checks all inherited properties of an object prototype, which can lead to some unexpected scenarios, so should be avoided:

```js
'valueOf' in {}; // true
```

Instead, use [`has`](https://lodash.com/docs#has) or [`Object#hasOwnProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty).

```js
{}.hasOwnProperty( 'valueOf' ); // false
has( {}, 'valueOf' ); // false
```

[`has`](https://lodash.com/docs#has) and [`Object#hasOwnProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty) are also recommended for testing the presence of an object key using variable input:


```js
const key = 'someParam';
const object = {
	someParam: 'someValue'
};

object.hasOwnProperty( key ); // true
has( object, key ); // true
```

## Strings

Use single-quotes for string literals:

```js
const myStr = 'strings should be contained in single quotes';
```

When a string contains single quotes, they need to be escaped with a backslash (\\):

Double quotes can be used in cases where there is a single quote in the string or in JSX attributes.

```js
const myStr = "You're amazing just the way you are.";

const component = <div className="post"></div>;
```

[ES2015 template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) are available as an alternative to string concatenation when including variables in a string.

```js
// Before
const sumLabel = 'The sum of ' + a + ' and ' + b + ' plus ' + c +
	' is ' + ( a + b + c );
```
```js
// After
const sumLabel = `The sum of ${ a } and ${ b } plus ${ c } is ${ a + b + c }`;
```

## Switch Statements

Switch statements can be useful when there are a large number of cases – especially when multiple cases can be handled by the same block (using fall-through), or the default case can be leveraged.

When using switch statements:

- Note intentional cases of fall-through explicitly, as it is a common error to omit a break by accident.
- Indent case statements one tab within the switch.

```js
switch ( event.keyCode ) {

	// ENTER and SPACE both trigger x()
	case constants.keyCode.ENTER:
	case constants.keyCode.SPACE:
		x();
		break;
	case constants.keyCode.ESCAPE:
		y();
		break;
	default:
		z();
}
```

## Best Practices

### Variable names

The first word of a variable name should be a noun or adjective (not a verb) to avoid confusion with functions.

You can prefix a variable with verb only for boolean values when it makes code easier to read.

```js
// Bad
const play = false;
```
```js
// Good
const name = 'John';
const blueCar = new Car( 'blue' );
const shouldFlop = true;
```

### Function names

The first word of a function name should be a verb (not a noun) to avoid confusion with variables.

```js
// Bad
function name() {
	return 'John';
}
```
```js
// Good
function getName() {
	return 'John';
}
```

You may prefix a function by `is` or `has` to indicate a Boolean return value.

```js
function isValid() {
	return true;
}
```

### Arrays

Creating arrays in JavaScript should be done using the shorthand `[]` constructor rather than the `new Array()` notation.

```js
const myArray = [];
```

You can initialize an array during construction:

```js
const myArray = [ 1, 'WordPress', 2, 'Blog' ];
```

In JavaScript, associative arrays are defined as objects.

### Objects

There are many ways to create objects in JavaScript. Object literal notation, `{}`, is both the most performant, and also the easiest to read.

```js
const myObj = {};
```

Object literal notation should be used unless the object requires a specific prototype, in which case the object should be created by calling a constructor function with new.

```js
const myObj = new ConstructorMethod();
```

Object properties should be accessed via dot notation, unless the key is a variable, a reserved word, or a string that would not be a valid identifier:

```js
prop = object.propertyName;
prop = object[ variableKey ];
prop = object[ 'default' ];
prop = object[ 'key-with-hyphens' ];
```

That said, avoid accessing nested properties through a chain of dot notation as this can lead cause access errors.
Instead, use Lodash's [`get`](https://lodash.com/docs#get) function. It will safely handle cases where a property or object is missing at any point in the nesting chain.

```js
const object = {
	nestedObject: {
		property: 'value'
	}
};

// Bad
nestedProp = object.nestedObject.property;
anotherNestedProp = object.nestedObject.anotherProperty; // This will throw an error

// Good
nestedProp = get( object, 'nestedObject.property' );
anotherNestedProp = get( object, 'nestedObject.anotherProperty' ); // safely returns undefined
```

## “Yoda” Conditions #

Since we require strict equality checks, we are not going to enforce [Yoda conditions](https://en.wikipedia.org/wiki/Yoda_conditions). You're welcome to use them, but the most important consideration should be readability of the conditional.

## Iteration

Starting in [ECMAScript 5](https://en.wikipedia.org/wiki/ECMAScript#5th_Edition), JavaScript includes many methods and patterns inspired by functional programming.

We encourage you to make use of these methods in favor of traditional `for` and `while` loops:

- [`Array#map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [`Array#filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [`Array#reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
- [`Array#some`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
- [`Array#every`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every)

Calypso [includes polyfills](https://github.com/Automattic/wp-calypso/pull/25419) for many more Array prototype methods that were added in ES2015 and beyond. You can safely use them without fear of breaking older browsers. If it's more convenient you can also use their [Lodash](https://lodash.com/) equivalents. For example:

- [`_.find`](https://lodash.com/docs/#find) ([`Array#find`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find))
- [`_.findIndex`](https://lodash.com/docs/#findIndex) ([`Array#findIndex`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex))
- [`_.includes`](https://lodash.com/docs/#includes) ([`Array#includes`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes))

Introduced in ES2015, [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) provide a shorter syntax for function expressions while preserving the parent scope's `this` context. Arrow functions are especially well-suited for iteration method callbacks.

__Examples__

Creating an array of React elements from an array of post objects:

```js
posts.map( ( post ) => (
	<Post post={ post } key={ post.global_ID } />
) );
```

Check whether every post in an array of post objects is published:

```js
posts.every( ( post ) => post.status === 'publish' );
```

Group an array of post objects by status:

```js
posts.reduce( ( memo, post ) => {
	memo[ post.status ] = ( memo[ post.status ] || [] ).concat( post );
	return memo;
}, {} );
```

__Rationale: contracts in code__

It could be argued that these functional helpers are not so different from `for` and `while`; after all, they are implemented with the same base loops and can't _do_ anything that `for` and `while` can't.

`map` and friends are more precise ways to talk about consistent patterns in data manipulation. Preferring them over `for` is analogous to using the word "cake" instead of saying "the kind of food that you make by whipping egg whites and maybe adding sugar", with the benefit that `map` and friends are easily and legibly composable — to stretch the analogy, butter cakes are to cakes what `pluck` is to `map`.

Even assuming a comparison where `map` and `for` are used as equivalently as possible (_e.g._ both with the same inlined callback), with `map` or `filter` you are intentionally limiting your power. You _establish a [contract][contracts not apis]_, wherein you say:

- you're not going to mutate the collection;
- (in the case of `map`) you're going to return a collection with the same size and with data derived from the original collection's individual items;
- (in the case of `filter`) you're going to return a subset of the original collection, preserving the items and the order.

These important statements are part of the abstraction. As for the side effects:

- `map` and `filter` prevent you from yielding side effects by default, whereas the default with `for` is to mutate, unless you have an additional statement to create a new empty collection beforehand;
- `for` inherently requires more noise to be added, as you need to set up the conditions of the loop and handle the iterating variable. _Noise dilutes intent._ Noise also makes it easier for mistakes to slip through. Anything from a misspelled `array.lenght`, to a rogue comma or an illogical condition — ultimately, those are technicalities that you didn't actually need to care about in the first place, yet they lead to pesky bugs creeping in.

`for` will still have its uses, but for _most_ scenarios we have well-known higher-level terms. With the caveat that there is such a thing as too "sophisticated" and opaque vocabulary, by continuously learning and choosing the right functional programming iterator we collectively develop the fineness of our expression as developers centered around a common project.

[contracts not apis]: https://twitter.com/dan_abramov/status/618757668862357504

## React components

- Use [stateless function components or the `React.Component` class](https://facebook.github.io/react/docs/components-and-props.html#functional-and-class-components) instead of `React.createClass`
  - Unlike `React.createClass`, methods of components extending `React.Component` are not automatically bound to the instance. Instead, you will need to bind the functions in your component's constructor or use [class instance property initializers](https://github.com/tc39/proposal-class-public-fields)
- Use [PropTypes](https://facebook.github.io/react/docs/typechecking-with-proptypes.html) to validate prop types and help set usage expectations for other developers
- Use [JSX](https://facebook.github.io/jsx/) for creating React elements, like those returned from a component's `render` function
- Methods that are bound to event handlers should have descriptive names. 
  - Avoid naming methods after event handlers like `onClick`, `onSubmit`, etc.
  - You can use fat arrow functions if it makes handling the event cleaner.
- Avoid prefixing method names with `_`.
- If you find that your render logic becomes complex, it might be a sign that you should split the component into separate individual components.

```jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Link extends Component {
	static propTypes = {
		href: PropTypes.string,
		onNavigate: PropTypes.func,
		children: PropTypes.node
	};

	navigate = ( event ) => {
		event.preventDefault();
		this.props.onNavigate();
	}

	render() {
		const { href, children } = this.props;

		return (
			<a href={ href } onClick={ this.navigate }>
				{ children }
			</a>
		);
	}
}
```

## ES6

We support and encourage ES6 features thanks to [Babel](https://babeljs.io/) transpilation and the accompanying polyfill.

Resources:

1. [ECMAScript® 2015 Language Specification](http://www.ecma-international.org/ecma-262/6.0/)
2. [Babel](https://babeljs.io/)
3. [Overview of ECMAScript 6 features](https://github.com/lukehoban/es6features)
4. [ECMAScript 6 new features overview & comparison](http://es6-features.org/)
6. [More Resources](https://github.com/airbnb/javascript#resources) - listed by Airbnb

## ESLint

To help encourage developers to follow our coding standards, we include an [ESLint](http://eslint.org/) configuration file [`.eslintrc.js`](../../.eslintrc.js) that configures [ESLint](http://eslint.org/) to detect code that doesn't follow the guidelines. ESLint also catches basic syntax errors, and natively supports both ES6 and JSX. It can be extended by plugins, such as [`eslint-plugin-wpcalypso`](https://github.com/Automattic/eslint-plugin-wpcalypso), which we use in our configuration.

There are [integrations](http://eslint.org/docs/user-guide/integrations) for many editors that will automatically detect the configuration file and run the checks.

In cases where ESLint incorrectly identifies code as not following our standards, you can [disable rules using inline comments](http://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments). Before disabling a rule, be certain and vocal that you understand the reason for it needing to be disabled. Our ESLint configuration is very well-tuned, and disabling a rule is not appropriate as an escape valve for poorly written code. If you don't understand or disagree with the existence of a rule, open an issue to start a discussion.

### [Automatically Run ESLint Against Your Changesets](#setting-up-githooks)

If you would like to have your changes automatically run through ESLint - there is a git pre-commit hook in `bin/pre-commit-hook.js` that will perform the task. It will be run everytime you do a `git commit`.

If ESLint encounters any issues inside any .jsx or .js files you have updated, an error will be displayed, and the commit will not proceed.  Here is an example of an attempted commit with the hook installed:

![pre-commit](https://cldup.com/hec5WcVc_L-3000x3000.png)

#### Running ESLint across entire project

To lint the entire project, from the root of your working directory run:

```bash
yarn run lint:js
```


#### Sublime Text

_These instructions assume Sublime Text 3_

If you are using Sublime Text, you can use the `SublimeLinter-eslint` plugin to visually highlight linting errors in your code. Dan Abramov has a great [instructional blog post](https://medium.com/@dan_abramov/lint-like-it-s-2015-6987d44c5b48#b355) to get up and running with ESLint in Sublime Text.

Before following these instructions, you'll want to globally install ESLint and related dependencies by running the following command in your terminal:

```bash
yarn global add eslint babel-eslint eslint-plugin-react eslint-plugin-wpcalypso eslint-config-wpcalypso
```

#### Identifying Spaces with Sublime Text

When you install the `SublimeLinter` package, it will identify mixed spaces and tabs in your code, but it won't identify lines whose leading characters are comprised of only spaces.

To make identifying spaces easier, you can install the [Highlight Whitespaces](https://github.com/disq/HighlightWhitespaces) package, then add the following user setting (Preferences > Package Settings > Highlight Whitespaces > Settings - User) so that it doesn't also highlight tabs:

```
{
	"highlight_whitespaces_check_tabs": false
}
```
