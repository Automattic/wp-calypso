# Immutable Chai
The tea that never gets empty.

This is a helper for `chai`, our usual assertion library, to make dealing with `immutable` data structures a bit easier and nicer. We include it by default in the runner bootstrap, so you don't really have to do anything to use it.

### But... chai-immutable exists?
Yes it does, but it does a couple things that make life hard. It overrides `eql` and `equal` to try and take special behavior when the things being asserted are `Immutable` instances, but it's quite fragile. This registers a new method, `immutablyEqual` which uses a `immutable.is` check to do the work. This works for a wide variety of comparisons.

Additionally it provides an easy to read diff.

## Usage

```js
// in a test module

import { fromJS } from 'immutable';

describe( 'my test', () => {
	it( 'should be able to compare immutable things', () => {
		expect( fromJS( { one: 1, two: 2 } ) ).to.immutablyEqual( fromJS( { two: 2, one: 1 } ) );
	} );
} );

```
