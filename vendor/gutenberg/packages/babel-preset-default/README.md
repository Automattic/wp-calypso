# @wordpress/babel-preset-default

Default [Babel](https://babeljs.io/) preset for WordPress development.

## Installation

Install the module

```bash
npm install @wordpress/babel-preset-default --save-dev
```

### Usage

#### Via .babelrc (Recommended)

```json
{
  "presets": [ "@wordpress/default" ]
}
```

#### Via CLI

```bash
babel script.js --presets @wordpress/default
```

#### Via Node API

```js
require( '@babel/core' ).transform( 'code', {
  presets: [ '@wordpress/default' ]
} );
```

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
