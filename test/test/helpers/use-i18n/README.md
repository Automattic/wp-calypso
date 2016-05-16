Use i18n
========

##### Initializes i18n with default bootstrap

Because i18n initialization occurs during the client boot step in the browser, it will not be available when testing your components in isolation. This helper initializes i18n before your tests run.

## Usage

```js
import useI18n from 'test/helpers/use-i18n';

describe( 'component', () => {
	useI18n();

	it( 'should have translate available', () => {
		// Modules or components calling to `i18n.translate` will not result
		// in an error
	} );
} );
```

## Caveats

1. If used in combination with the [`use-mockery` helper](../use-mockery), you will likely want to call `useI18n` after `useMockery`, since using Mockery will cause module caches to be reset.
2. This helper does not inject the `translate` mixin to your components. You may want to consider authoring your components using the [`localize` higher-order component](../../../../client/lib/mixins/i18n/localize). Otherwise, you may override the function autobind map for your component before running your tests:

```js
before( () => {
	MyComponent.prototype.translate = ( string ) => string;	
} );
```
