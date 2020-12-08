# Always import combineReducers from 'calypso/state/utils'

In Calypso we should always import `combineReducers` from `calypso/state/utils` instead of `redux`. Our reducing function handles
persistence for us. If we use the default reducing function from redux, we may persist state accidentally.

See also: [Opt-in to Persistence](https://github.com/Automattic/wp-calypso/blob/HEAD/docs/our-approach-to-data.md#opt-in-to-persistence--13542-)

## Rule Details

The following patterns are considered warnings:

```js
import { combineReducers } from 'redux';
```

The following patterns are not warnings:

```js
import { combineReducers } from 'calypso/state/utils';
```

```js
import { createStore } from 'redux';
```
