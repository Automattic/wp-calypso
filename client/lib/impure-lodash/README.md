# Impure lodash dependencies

Most of `lodash`'s functions are pure; they cause no side-effects and depend on no external state.
Some, however, _do_, which can mess up tests.
We have to mock these functions in tests, but we run into problems why trying to mock named exports in ES2015 modules.
This code exists to overcome these challenges by providing a test-safe wrapper around the `lodash` functions.

## Usage

Just import the functions from here instead of directly from `lodash` and everything should be safe and mockable.

## Explanation

The main problem with mocking named exports is that they are, by design, immutable.
A module importing a named export cannot change that named export, which is what mocking attempts to do
In this new module we export a single object instead of separate named exports.
When importing this works the same way…

```js
import impureLodash from 'calypso/lib/impure-lodash';
const { uniqueId } = impureLodash;
```

However, the big difference from importing from `lodash` directly is that since this export is itself an object with member methods, that object is changeable.
This is a language quirk the same way that `const` arrays and objects are mutable.
We cannot rebind the default export, but we can alter the data at the object it references.

## Caution

This is a pretty ugly solution to the deeper problem: we can't easily mock named exports in ES2015 modules.
Once we find a better solution we should replace this and all code which calls it.
