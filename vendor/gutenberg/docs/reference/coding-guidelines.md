# Coding Guidelines

This living document serves to prescribe coding guidelines specific to the Gutenberg editor project. Base coding guidelines follow the [WordPress Coding Standards](https://make.wordpress.org/core/handbook/best-practices/coding-standards/). The following sections outline additional patterns and conventions used in the Gutenberg project.

## CSS

### Naming

To avoid class name collisions between elements of the editor and to the enclosing WordPress dashboard, class names **must** adhere to the following guidelines:

Any default export of a folder's `index.js` **must** be prefixed with `editor-` followed by the directory name in which it resides:

>.editor-_[ directory name ]_

(Example: `.editor-inserter` from `inserter/index.js`)

For any descendant of the top-level (`index.js`) element, prefix using the top-level element's class name separated by two underscores:

>.editor-_[ directory name ]_\_\__[ descendant description ]_

(Example: `.editor-inserter__button-toggle` from `inserter/button.js`)

For optional variations of an element or its descendants, you may use a modifier class, but you **must not** apply styles to the modifier class directly; only as an additional selector to the element to which the modifier applies:

>.editor-_[ directory name ]_.is-_[ modifier description ]_
>.editor-_[ directory name ]_\_\__[ descendant description ]_.is-_[ modifier description ]_

(Example: `.editor-inserter__button-toggle.is-active` )

In all of the above cases, except in separating the top-level element from its descendants, you **must** use dash delimiters when expressing multiple terms of a name.

You may observe that these conventions adhere closely to the [BEM (Blocks, Elements, Modifiers)](http://getbem.com/introduction/) CSS methodology, with minor adjustments to the application of modifiers.

#### SCSS File Naming Conventions for Blocks

The build process will split SCSS from within the blocks library directory into two separate CSS files when Webpack runs.

Styles placed in a `style.scss` file will be built into `blocks/build/style.css`, to load on the front end theme as well as in the editor. If you need additional styles specific to the block's display in the editor, add them to an `editor.scss`.

Examples of styles that appear in both the theme and the editor include gallery columns and drop caps.

## JavaScript

### Imports

In the Gutenberg project, we use [the ES2015 import syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) to enable us to create modular code with clear separations between code of a specific feature, code shared across distinct WordPress features, and third-party dependencies.

These separations are identified by multi-line comments at the top of a file which imports code from another file or source.

#### External Dependencies

An external dependency is third-party code that is not maintained by WordPress contributors, but instead [included in WordPress as a default script](https://developer.wordpress.org/reference/functions/wp_enqueue_script/#default-scripts-included-and-registered-by-wordpress) or referenced from an outside package manager like [npm](https://www.npmjs.com/).

Example:

```js
/**
 * External dependencies
 */
import TinyMCE from 'tinymce';
```

#### WordPress Dependencies

To encourage reusability between features, our JavaScript is split into domain-specific modules which [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) one or more functions or objects. In the Gutenberg project, we've distinguished these modules under top-level directories. Each module serve an independent purpose, and often code is shared between them. For example, in order to localize its text, editor code will need to include functions from the `i18n` module.

Example:

```js
/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
```

#### Internal Dependencies

Within a specific feature, code is organized into separate files and folders. As is the case with external and WordPress dependencies, you can bring this code into scope by using the `import` keyword. The main distinction here is that when importing internal files, you should use relative paths specific to top-level directory you're working in.

Example:

```js
/**
 * Internal dependencies
 */
import VisualEditor from '../visual-editor';
```

### Experimental APIs

Exposed APIs that are still being tested, discussed and are subject to change should be prefixed with `__experimental`, until they are finalized. This is meant to discourage developers from relying on the API, because it might be removed or changed in the (near) future.

Example:

```js
export {
	internalApi as __experimentalExposedApi
} from './internalApi.js';
```

### Variable Naming

Gutenberg inherits [WordPress' naming conventions of camel-casing](https://make.wordpress.org/core/handbook/best-practices/coding-standards/javascript/#naming-conventions):

>Variable and function names should be full words, using camel case with a lowercase first letter. This is an area where this standard differs from the WordPress PHP coding standards.
>
>Constructors intended for use with `new` should have a capital first letter (UpperCamelCase).

However, Gutenberg is more specific about its handling of abbreviations, acronyms, constants, and the ES2015 class construct.

#### Abbreviations and Acronyms

[*Abbreviations*](https://en.wikipedia.org/wiki/Abbreviation) must be written as camel case, with an initial capitalized letter followed by lowercase letters.

[*Acronyms*](https://en.wikipedia.org/wiki/Acronym) must be written with each of its composing letters capitalized. This is intended to reflect that each letter of the acronym is a proper word in its expanded form.

If an abbreviation or an acronym occurs at the start of a variable name, it must be written to respect the camelcase naming rules covering the first letter of a variable or class definition. For variable assignment, this means writing the abbreviation entirely as lowercase. For class definitions, its initial letter should be capitalized.

**Examples:**

```js
// "Id" is an abbreviation of "Identifier":
const userId = 1;

// "DOM" is an acronym of "Document Object Model":
const currentDOMDocument = window.document;

// Acronyms and abbreviations at the start of a variable name are consistent
// with camelcase rules covering the first letter of a variable or class.
const domDocument = window.document;
class DOMDocument {}
class IdCollection {}
```

#### Class Definition

A [`class` definition](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) must use the UpperCamelCase convention, regardless of whether it is intended to be used with `new` construction.

**Example:**

```js
class Earth {
	static addHuman( human ) {
		Earth.humans.push( human );
	}

	static getHumans() {
		return Earth.humans;
	}
}

Earth.humans = [];
```

All `@wordpress/element` Components, including stateless function components, should be named using Class Definition naming rules, both for consistency and to reflect the fact that a component may need to be transitioned from a function to a class without breaking compatibility.

**Examples:**

```js
class MyComponent extends Component {}

function MyComponent() {}
```

#### Constants

An exception to camel case is made for constant values which are never intended to be reassigned or mutated. Such variables must use the [SCREAMING_SNAKE_CASE convention](https://en.wikipedia.org/wiki/Snake_case).

In almost all cases, a constant should be defined in the top-most scope of a file. It is important to note that [JavaScript's `const` assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) is conceptually more limited than what is implied here, where a value assigned by `const` in JavaScript can in-fact be mutated, and is only protected against reassignment. A constant as defined in these coding guidelines applies only to values which are expected to never change, and is a strategy for developers to communicate intent moreso than it is a technical restriction.

## PHP

We use
[`phpcs` (PHP\_CodeSniffer)](https://github.com/squizlabs/PHP_CodeSniffer) with the [WordPress Coding Standards ruleset](https://github.com/WordPress-Coding-Standards/WordPress-Coding-Standards) to run a lot of automated checks against all PHP code in this project.  This ensures that we are consistent with WordPress PHP coding standards.

The easiest way to use PHPCS is [local environment](https://github.com/WordPress/gutenberg/blob/master/CONTRIBUTING.md#local-environment). Once that's installed, you can check your PHP by running `npm run lint-php`.

If you prefer to install PHPCS locally, you should use `composer`. [Install `composer`](https://getcomposer.org/download/) on your computer, then run `composer install`.  This will install `phpcs` and `WordPress-Coding-Standards` which you can the run via `vendor/bin/phpcs`.
