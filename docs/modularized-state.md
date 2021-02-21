# Modularized State

Calypso currently uses Redux for managing state (see [Our Approach to Data](./our-approach-to-data.md) for more details on the current approach, and the history that led to it). This has been a successful strategy in managing state across the application, but the standard Redux approach is not without its issues.

## The issue

The official recommendation is to have a single root reducer, composed of smaller reducers responsible for individual portions of state. The root reducer needs to be ready as soon as the first action is emmitted, and therefore becomes part of the critical path for the application.

This approach works well for smaller applications, but the more state exists, the more code gets added to the critical path through the reducers. The reducers themselves may not be too large, but they often depend on internal and external libraries, as well as large sets of data that for various reasons are bundled with the application rather than retrieved via an API at runtime. Since reducers are usually synchronous, none of this can be asynchronously loaded, and thus everything becomes part of the critical path.

This means that the standard Redux approach often has poor scalability where it comes to loading performance.

## Requirements for a Solution

In order to preserve the benefits of a Redux-based architecture while reducing the amount of code loaded at boot, we looked into how we could modularize state. However, any solution had to obey a few key principles:

- We shouldn't have to declare which portions of Calypso use which parts of state. This is hard to determine and to maintain, since it can change very easily.
- We shouldn't have to change large portions of code. This excludes approaches that would make state asynchronous, for example.
- Consumers of state should not be aware of modularization. A component that makes use of a selector shouldn't need to worry about whether that state is modularized or not.

## Overview of our Solution

We opted for a synchronous, dependency-graph driven approach, where reducers are automatically loaded together with the chunks that make use of them. In a nutshell:

- State is divided into top-level portions. Each of these portions is considered an atom that can't be subdivided (for the purposes of loading).
- Each portion's reducer persists its state separately, using `withStorageKey`.
- Each portion has an `init` module, that registers its reducer through a side-effect.
- Each selector or action creator that accesses a portion of state must import its `init` module

By doing this, we only need to couple selectors and action creators with the portions of state they touch, and everything else is handled automatically as part of the build process. Reducers are guaranteed to be available and registered by the time the state they manage is needed.

## Step-by-step

### How to add new state

If you're adding a new portion of state to Calypso, start by writing the reducers, selectors, and action creators as normal. The following folder structure is preferred:

```text
client/state/
└── { subject }/
    ├── reducer.js
    ├── actions/
    |   ├── index.js
    |   ├── action1.js
    |   └── action1.js
    └── selectors/
        ├── index.js
        ├── selector1.js
        └── selector2.js
```

For testing purposes, you can add the reducer to the root reducer at `client/state/reducer`, but bear in mind this is the default, non-modularized approach.

### Modularizing state

Once your new state is in place, or if you're working on migrating existing state, the next step is to modularize it.

#### Add `init` module

To start, add an `init` file to the root of that portion of state:

```text
client/state/
└── { subject }/
    ├── init.js
    └── reducer.js
```

The `init` file should register the reducer with the global store:

```js
/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import reducer from './reducer';

registerReducer( [ 'subject' ], reducer );
```

#### Add `package.json` file

It's generally a good idea to tell `webpack` when a file has side-effects, to prevent it from assuming that everything does. Our `init` file has side-effects, so create another file named `package.json` at the root of that portion of state. It may be odd to create a `package.json` file where there is no package, but it's currently the best way of letting `webpack` know about side-effects.

```json
{
	"sideEffects": [
		"./init.js"
	]
}
```

#### Persist state to a separate key

For persistence to work correctly, you'll need to modify the reducer so that it stores its data separately. Change the default export to use `withStorageKey`:

```js
export default withStorageKey( 'subject', combinedReducer );
```

#### Ensure selectors and action creators initialize state

Once this is done, you'll need to find every selector and action creator that accesses this portion of state. If it follows the recommended folder structure above that's easy to do, but otherwise you'll need to look in `state/selectors`. You may also find some components accessing state directly with inline selectors (some refactoring would probably be a good idea in that situation).

Here's what a modified selector module could look like:

```js
import 'calypso/state/subject/init';

export default function getSubjectMatter( state ) {
	// ...
}
```

The same goes for an action creator:

```js
import 'calypso/state/subject/init';

export function changeSubjectMatter( matter ) {
	// ...
}
```

#### Remove state from legacy root reducer

Finally, once all the modularized machinery is in place, remove the reducer from the legacy list in `client/state/reducer` (and `client/landing/login/store`, which has its own list). It doesn't need to be there anymore, since it's now fully modularized!

## Troubleshooting

### Reducer with key 'foo' is already registered

This error usually means that you forgot to remove the reducer for this portion of state from `client/state/reducer` or `client/landing/login/store`, or that you registered it in the `init` file using the wrong key.

To explain a bit further, this error lets you know when you're registering a portion of state with a name that's already in use. Since our modularization approach prevents initialization from happening twice, that's usually only the case when the key is already present in the legacy root reducer, or when you accidentally used the name of another portion of state (due to e.g. a copy-paste error).

### Failing unit tests

Some unit tests may start failing once you modularize a portion of state (even if it seems unrelated, at first). This is usually because they create their own Redux store, which may have not been set up correctly for modularization. You'll find something like this:

```js
import { createReduxStore } from 'calypso/state';
import Thing from '../';

describe( 'Thing', () => {
	test( 'renders correctly', () => {
		const store = createReduxStore();
		// Instantiate and test component
	} );
} );
```

Setting the store globally should be enough to solve these issues:

```js
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import Thing from '../';

describe( 'Thing', () => {
	test( 'renders correctly', () => {
		const store = createReduxStore();
		setStore( store );
		// Instantiate and test component
	} );
} );
```
