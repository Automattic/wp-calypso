# lib/deep-pick

A more featureful alternative to lodash's `pick` supporting nested properties.

```js
const data = {
	a: {
		aa: 11,
		ab: 12,
	},
	b: 2,
	c: 3,
};

<<< pick( data, [ 'a.aa', 'c', 'a' ] )
>>> {
      'a.aa': 11,
      c: 3,
      a: { aa: 11, ab: 12 },
    }
```
