# Welcome to Calypso's Codemod Collection!

## What are codemods?

Code modification scripts, also known as codemods, are transformation scripts that can simultaneously modify multiple files with precision and reliability. Codemods were popularized by [Facebook's engineering team](https://medium.com/@cpojer/effective-javascript-codemods-5a6686bb46fb) and depends greatly on Facebook's [jscodeshift](https://github.com/facebook/jscodeshift) library, which wraps over a library named [recast](https://github.com/benjamn/recast) (author of which is associated with the [Meteor](https://www.meteor.com/) project).

## How to run our codemods

It's easy! Our codemod script uses the following CLI:

```bash
./bin/codemods/run.js transformation-name[,second-name,third-name] target [additional targets]
```

```bash
# Same as above, but using npm scripts
npm run codemod transformation-name[,second-name,third-name] target [additional targets]
```

For example, if I wanted to run the `commonjs-exports` transformation on `client/devdocs/`, I can do the following:

```bash
./bin/codemods/run.js commonjs-exports client/devdocs/
```

Do you want to target files individually? We can do that, too!

```bash
./bin/codemods/run.js commonjs-exports client/devdocs/a.js client/devdocs/b.js client/devdocs/c.js
```

How about chaining codemods on multiple directories?

```bash
./bin/codemods/run.js commonjs-imports,commonjs-exports,named-export-from-default client/blocks/ client/components/
```

## How to run codemods manually

If you're developing your own transformations, it may be useful to know you can invoke your transformation directly using jscodeshift like so:

```bash
./node_modules/.bin/jscodeshift -t transformation.js [target files]
```

## List of available transformations

### 5to6-codemod scripts ([docs](https://github.com/5to6/5to6-codemod#transforms))

- commonjs-exports
	- This codemod converts `module.exports` to `export` and `export default`.

- commonjs-imports
	- This transformation converts occurrences of `require( '...' )` to `import ... from '...'` occurring at the top level scope. It will ignore CommonJS imports inside block statements, like conditionals or function definitions.

- commonjs-imports-hoist
	- This transformation hoists all occurrences of `require( '...' )` inside if, loop, and function blocks. This can cause breakage! Use with caution.

- named-exports-from-default
	- This transformation generates named exports given a `default export { ... }`. This can be useful in transitioning away from namespace imports (`import * as blah from 'blah'`) to named imports (`import named from 'blah'`).

### React scripts ([docs](https://github.com/reactjs/react-codemod))

- react-create-class
	- This transformation converts instances of React.createClass to use React.Component instead.

- react-proptypes
	- This transformation converts instances of React.PropTypes to use prop-types instead.

### Local scripts
- combine-reducer-with-persistence
	- This transformation converts combineReducers imports to use combineReducersWithPersistence.

- combine-state-utils-imports
	- This transformation combines state/utils imports.

- i18n-mixin-to-localize
  - This transformation converts the following:
		- `this.translate` to `this.props.translate`
		- `this.moment` to `this.props.moment`
		- `this.numberFormat` to `this.props.numberFormat`
	- If any of the above conversions is performed, this transformation will wrap the React.createClass instance with a `localize()` higher-order component.

- merge-lodash-imports
	- This transformation merges multiple named lodash imports into one

-	modular-lodash-no-more
	- This transformation converts modular lodash imports to ES2015-style imports

- modular-lodash-requires-no-more
	- This transformation converts modular lodash requires to ES2015-style imports

- rename-combine-reducers
	- This transformation converts combineReducersWithPersistence imports to use combineReducers from 'state/utils'

- sort-imports
	- This transformation adds import comment blocks and sorts them as necessary.
	- Note: It only needs to be run twice because of a bug where in certain cases an extra newline is added
	on the first run.  The second run removes the extra newline.
