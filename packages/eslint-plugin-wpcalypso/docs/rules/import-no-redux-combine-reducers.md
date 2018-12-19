# Always import combineReducers from 'state/utils'

In Calypso we should always import `combineReducers` from `state/utils` instead of `redux`. Our reducing function handles
persistence for us. If we use the default reducing function from redux, we may persist state accidentally.

See also: [Opt-in to Persistence](https://github.com/Automattic/wp-calypso/blob/master/docs/our-approach-to-data.md#opt-in-to-persistence--13542-)

## Rule Details

The following patterns are considered warnings:

```js
import { combineReducers } from 'redux';
```

The following patterns are not warnings:

```js
import { combineReducers } from 'state/utils';
```

```js
import { createStore } from 'redux';
```
