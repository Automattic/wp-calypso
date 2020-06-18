Our Approach to Data
====================

Throughout Calypso's development, our approach to handling data has evolved to allow us to better adapt to the scale at which the application has grown. These shifts have not been ubiquitously adopted throughout the codebase, so you'll occasionally encounter legacy code which is not consistent with our current recommendations. The purpose of this document is to outline a history of these approaches such that you as the developer can understand the differences between each. Furthermore, it seeks to prescribe our current set of recommendations with regard to data management.

## History

There have been three major "eras" of data management throughout the lifetime of Calypso's development. Below, you will find a description of each, common identifying features, and reasons it was adopted in favor of the previous approach.

### First Era: Emitter Objects (June 2014 - April 2015)

Our original approach to managing data took an object-oriented approach, wherein an instance of the store would inherit the [`EventEmitter` interface](https://nodejs.org/api/events.html#events_class_eventemitter). Typically, a single instance of each object store was shared across the entire application. The instance was responsible for storing data, but included conveniences to automatically fetch data upon the first request. Used in combination with the [`data-observe` mixin](../client/lib/mixins/data-observe), a developer could monitor an instance of the store passed as a prop to a React component to automatically re-render its contents if the store emitted a `change` event.

__Identifying characteristics:__

- Module directories in `lib`, suffixed with `-list`
- Index file exports a common shared instance of the object prototype
- A `list.js` file includes the store prototype
- The list contains a `get` method which triggers a fetch if no data exists
- Used with the [`data-observe` mixin](../client/lib/mixins/data-observe) in a React component

### Second Era: Facebook Flux (April 2015 - December 2015)

Facebook's [Flux architecture](https://facebook.github.io/flux/) is a pattern that encourages a [unidirectional data flow](https://facebook.github.io/flux/img/overview/flux-simple-f8-diagram-explained-1300w.png) in which stores can only be manipulated via actions dispatched by a global dispatcher object. The raw data is never exposed by the store module, and as such, data can only be accessed by using helper ("getter") methods from the exported object. Much like the event emitter object approach, a Flux store module inherits from the [`EventEmitter` interface](https://nodejs.org/api/events.html#events_class_eventemitter), though a Flux store should only ever emit a `change` event (this was common but not as strictly enforced in our emitter objects). Stores subscribe to the dispatcher and listen for actions it is concerned with. Action creators are responsible for dispatching these actions. As an example, it is common to have an action creator that triggers a fetch for data - this action creator would dispatch a `FETCH_` prefixed "view" action upon the initial request, then subsequently a `RECEIVE_` prefixed "server" action upon receiving the data. Any store in the application could react to one or both of these action types.

__Identifying characteristics:__

- Module directories in `lib`
- Modules include `actions.js` and at least one store (named or suffixed `store.js`)
- Action creators dispatch view or server actions on the global `Dispatcher` object
- Stores include a top-level object for data storage, which is not directly exported
- Stores export a number of helper getter functions for accessing known data
- Stores subscribe to the Dispatcher, manipulating data in response to action types it is concerned with

__Advantages:__

- Stores can be specialized to their specific needs since dispatched actions are run against all subscribing stores
- There is a single entry point by which data can enter the store. This is easier to manage as an application scales
- Data logic (e.g. fetching) is not intertwined with the storage of the data
- Adopting an accepted pattern grants us access to a community-driven ecosystem of reference implementations

### Third Era: Redux Global State Tree (December 2015 - February 2020)

[Redux](http://redux.js.org/), described as a "predictable state container", is an evolution of the principles advocated in Flux. It is not a far departure from Flux, but is distinct in many ways:

- There is typically a single store instance which maintains all state for the entire application
- Action creators do not call to the global dispatcher directly, but rather return simple action objects which can be passed to the [store `dispatch` method](https://redux.js.org/api/store#dispatchaction)
- While Flux Stores are responsible for maintaining own state, Redux reducers are composable functions that manipulate specific parts of the global state "tree"
- Since state is the [single source of truth](https://redux.js.org/introduction/three-principles#single-source-of-truth) for the entire application, reducers tend to be much simpler and more transparent than Flux stores

__Identifying characteristics:__

- Files exist within the `state` directory, mirroring the structure of the global tree
- React bindings use [`react-redux`](https://github.com/reactjs/react-redux) `connect`

__Advantages:__

- An arguably simpler abstraction to the same problems addressed by Facebook’s Flux implementation
- Better suited for server-side rendering, as the singleton nature of Flux stores exposes the risk of leaking session data between requests
- Encourages and often forces a developer toward writing functional, testable code
- Extendable, supporting middlewares to suit our specific needs and [conveniences for use with React](https://github.com/reactjs/react-redux)

### Fourth Era: Modularized Redux State Tree (February 2020 - Present)

This era builds upon the previous, using the same selectors, reducers and action creators that were created before. However, instead of creating a single monolithic root reducer on boot, the goal is instead to have individual reducers register themselves when needed. This is done synchronously and automatically through dependency graph resolution.

See [the Modularized State documentation](./modularized-state.md) for more details on how it works and how to implement it in new portions of state.

__Identifying characteristics:__

- Modularized reducers are not imported in the root reducer (`client/state/reducer`)
- Modularized reducers use `withStorageKey` to persist their state separately
- Modularized portions of state include an `init` module that registers the reducer as a side effect
- Action creators and selectors for a modularized portion of state import the `init` module

__Advantages:__

- Preserves most of the advantages of Redux, with the tradeoff that action creators and selectors need to import the `init` file for the portions of state they touch
- Significantly reduces the amount of code required to boot Calypso, improving loading performance
- More scalable approach, as Redux state continues to grow


## Current Recommendations

All new data requirements should be implemented as part of the global, modularized Redux state tree. The `client/state` directory contains all of the behavior describing the global application state. The folder structure of the `state` directory should directly mirror the sub-trees within the global state tree. Each sub-tree should include its own reducer, and preferably also its action creators and selectors.

### Terminology

The Redux documentation includes a [detailed glossary of terms](https://redux.js.org/glossary). Below is an abbreviated overview of a few of the most common terms:

- Global state (state tree): A deeply nested plain JavaScript object encapsulating the current state of the application, managed by a Redux store instance
- Store instance: An object which manages the current state of the application, both in holding the current state value ([`getState`](https://redux.js.org/api/store#getstate)), but also as an entry point to introducing new data ([`dispatch`](https://redux.js.org/api/store#dispatchaction))
- Action creators: A function that returns an action
- Actions: An object describing an intended state mutation
- Reducers: A function that, given the current state and an action, returns a new state
- Selectors: A helper function for retrieving data from the state tree. This is not a Redux term, but is a common pattern

### Folder Structure

The root module of the `state` directory exports a single reducer function. As the ongoing state modularization work isn't yet completed, it starts off with some legacy sub-reducers always being loaded, through a wrapped version of [Redux's `combineReducers` function](https://redux.js.org/api/combinereducers). Modularized sub-reducers are instead dynamically added to the single reducer as they're needed, rather than unconditionally added at boot.

Separating state into sub-reducers, whether legacy or modularized, allows us to separate data concerns into their own piece of the overall state. These pieces are reflected by the folder structure of the `state` directory, as shown in the hierarchy below:

```text
client/state/
├── index.js
├── action-types.js
└── { subject }/
    ├── actions/
    |   ├── index.js
    |   ├── action1.js
    |   └── action2.js
    ├── init.js          (for modularized state)
    ├── package.json     (for modularized state)
    ├── reducer.js
    ├── schema.js
    ├── selectors/
    |    ├── index.js
    |    ├── selector1.js
    |    └── selector2.js
    └── test/
        ├── actions.js   (or actions/)
        ├── reducer.js
        └── selectors.js (or selectors/)
```

For example, the reducer responsible for maintaining the `state.sites` key within the global state can be found in `client/state/sites/reducer.js`. It's quite common that the subject reducer is itself a combined reducer. Just as it helps to split the global state into subdirectories responsible for their own part of the tree, as a subject grows, you may find that it's easier to maintain pieces as nested subdirectories. This ease of composability is one of Redux's strengths.

Do bear in mind that state is always modularized at the top level, though. Even if a top-level reducer is composed of multiple smaller reducers, the top-level reducer is always loaded as a single atomic unit.

### Actions

An action describes an intent to change the state of the application. When an action object is [dispatched](https://redux.js.org/api/store#dispatchaction) to an instance of a Redux store, the reducer function for that store is called with the action. Given the structure of our application state, specific subtrees can maintain their own state in response to any actions for which they are concerned.

An action object should contain a `type` key describing the action. All action types are defined in [`state/action-types.js`](https://github.com/Automattic/wp-calypso/blob/master/client/state/action-types.js). For example, to describe the intent of changing the state to include a few new post objects, you might create an action with the type `POSTS_RECEIVE`. Any other relevant properties can be included in this object if they are needed by the reducer function handler.

As mentioned above, new actions should be added to `action-types.js`. Action types are considered global such that any state subtree's reducer can react to any action types dispatched through the system. The file should remain alphabetized, and we recommend suffixing the verb so that all actions within the same domain scope are in relative proximity. For example, rather than naming your actions `FETCH_POSTS` AND `RECEIVE_POSTS`, you should name them `POSTS_FETCH` AND `POSTS_RECEIVE`.

### Data Normalization

Because a Redux store is the [single source of truth](https://redux.js.org/introduction/three-principles#single-source-of-truth) for the entire application state, it is important that all known data be tracked within the state tree and that it be well-structured. In your reducer functions, consider the data being manipulated in the tree and ensure that subjects are appropriately separated to minimize redundancy and to avoid synchronization concerns. When a subject needs to refer to another part of the tree, store a reference (likely an ID). Tracking an indexed set of items makes it easy to navigate the tree when needing to perform a lookup.

As an example, consider that there are many variations of a "user" in the application. A user may be the current user, a subscriber to a site, or someone who has left a comment on a story in your Reader feed. Each of these display user data in different ways, and in some cases retrieve the data from different sources. However, they can all be classified as a user, and relations between the user and a display context can be established through references.

The following state tree demonstrates how users, sites, and posts may be interrelated, but where data is normalized in a way such that it is always kept in sync, avoiding duplication, and facilitating lookup.

```json
{
	"users": {
		"items": {
			"73705554": {
				"ID": 73705554,
				"login": "testonesite2014"
			}
		}
	},
	"sites": {
		"items": {
			"2916284": {
				"ID": 2916284,
				"name": "WordPress.com Example Blog",
				"description": "Just another WordPress.com weblog",
			}
		},
		"siteUsers": {
			"2916284": {
				"73705554": {
					"roles": [ "administrator" ]
				}
			}
		}
	},
	"posts": {
		"items": {
			"34": {
				"ID": 34,
				"title": "Hello World!",
				"site_ID": 2916284,
				"author_ID": 73705554
			}
		}
	}
}
```

### Data Components

First, if you haven't already, you should consider reading the following blog posts, as they help to explain the reasoning behind splitting data and visual concerns:

- [_Container Components_](https://medium.com/@learnreact/container-components-c0e67432e005#.zd590uacw)
- [_Presentational and Container Components_](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.cwn6alkqw)

With that in mind, we typically have a few concerns when building a component that has data needs:

- Ensuring that the necessary data is available
- Making the data available to the component
- Allowing the component to modify the data

The first of these, ensuring that data is available, is one that we'd wish to eliminate. It is unfortunate that a developer should concern themselves with the fetching behavior of data, as it would be preferable instead that a component describe its data needs, and that the syncing/fetching behavior be handled behind the scenes automatically. Tools like [Relay](https://facebook.github.io/relay/) get us closer to this reality, though Relay has environment requirements that we cannot currently satisfy. For the time being, we must handle our own data fetching, but we should be conscious of a future in which fetching is not a concern for our components.

Framed this way, we can consider two types of data components: app components and query components.

#### App components

An app component wraps a visual component, connecting it to the global application state. We use the [`react-redux` library](https://github.com/reactjs/react-redux) to assist in creating bindings between React components and the Redux store instance.

Below is an example of an app component that retrieves an array of posts for a given site and renders them. (This example uses the stateless function syntax for declaring components: see the [React 0.14 upgrade guide](https://reactjs.org/blog/2015/10/07/react-v0.14.html#stateless-function-components) if you're unfamiliar with it.)

```jsx
function PostsList( { posts } ) {
	return (
		<ul className="posts-list">
			{ posts.map( ( post ) => {
				return <li key={ post.id }>{ post.title }</li>;
			} ) }
		</ul>
	);
}

export default connect( ( state, ownProps ) => {
	return {
		posts: getSitePosts( ownProps.siteId )
	};
} )( PostsList );
```

In this example, the `PostsList` function defines the visual `PostsList` component.
It expects an array of `posts` passed as a prop, which it renders as a `ul`. The `connect` function wraps this purely presentational component to produce an app component.

`connect` accepts two arguments. Both pass props to the component. The first argument provides data; the second sets the component up to handle behavior.

1. `mapStateToProps`: A function which, given the store state, returns props to be passed to the app component. This argument allows us to pass store data to the component.
2. `mapDispatchToProps`: A function which, given the store dispatch method, also returns props to be passed to the app component. This argument can enable the component to update the store state.

In the example above we only pass the first argument, `mapStateToProps`. As another example, consider a component which renders a Delete button for a given post. We want to display the post title as a label in the delete button, and allow the component to trigger the post deletion when clicked.

```jsx
import React from 'react';
import { localize } from 'i18n-calypso';

const PostDeleteButton = ( { delete, label, translate } ) => (
  <button onClick={ delete }>
    { translate( 'Delete %s', {
      args: [ label ]
    } ) }
  </button>
);

export default connect(
	( state, ownProps ) => {
		return {
			label: getSitePost( ownProps.siteId, ownProps.postId ).title
		};
	},
	( dispatch, ownProps ) => {
		return {
			delete: () => dispatch( deleteSitePost( ownProps.siteId, ownProps.postId ) )
		};
	}
)( localize( PostDeleteButton ) );
```

In this example we pass both arguments to `connect`.

`connect` is a [currying](https://www.sitepoint.com/currying-in-functional-javascript/) function: after we invoke it with the `mapStateToProps` and `mapDispatchToProps` arguments we call it a second time, this time passing the `PostDeleteButton` visual component. `connect` takes this component class and returns a new one which is connected to the store. The resulting component can have additional props which were not defined in the original class.

At this point, you might observe that the visual elements rendered in `<PostDeleteButton />` aren't very specific to posts and could probably be reused in different contexts. This is a good observation to make, and in this case it might make sense to split the visual component to its own separate file (e.g. `client/components/delete-button/index.jsx`). You should try to identify these opportunities as often as possible. Since the `connect` wrapping function is detached from the component declaration in the file above, it should not be difficult to separate the two.

Separating visual and data concerns is a good mindset to have when approaching components, and whenever possible, we should strive to create reusable visual components which accept simple props for rendering. However, pragmatically it is unreasonable to assume that components will always be reused and that there's always a clear divide between the visual and data elements. As such, while we recommend creating purely visual components whenever possible, it is also reasonable to create components that are directly tied to the global application state.

#### Query components

Query components accept as few props as possible to describe the data needs of the context in which they're used. They are responsible for dispatching the actions that fetch the desired data from the WordPress.com REST API. They should neither accept nor render any children.

The benefits of query components are that they (a) are reusable, (b) take advantage of React's lifecycle methods to ensure that data needs are kept in sync, and (c) can be used by app components to maintain their self-sufficiency. That they neither accept nor render children eliminates the need for ancestor components to concern themselves with the data needs of leaf components and [can be more performant](https://www.youtube.com/watch?v=KYzlpRvWZ6c&t=1137).

When creating a component that needs to consume data, we can simply include a query component as a child of that component.

Refer to the [`<QueryPosts />` component](https://github.com/Automattic/wp-calypso/tree/master/client/components/data/query-posts) as an example of a query component. New query components should be added to the `components/data` directory, prefixed with `query-` such to distinguish them from legacy data components.

### Selectors

A selector is simply a convenience function for retrieving data out of the global state tree. Since the global state tree is a plain JavaScript object, there's nothing to stop you from accessing data directly, but you may find that creating a selector will help to reduce repetition, improve the semantic meaning of your code, and avoid mistakes. For example, the following two approaches both serve to retrieve an array of posts for a specific site, though you might find the selector more convenient and readable at a glance:

```js
// Using a selector
let posts = getSitePosts( state, siteId );

// Navigating the state tree
let posts = state.sites.sitePosts[ siteId ].map( ( postId ) => state.posts.items[ postId ] );
```

In addition, following our modularized state approach (see [`client/state/README.md`](https://github.com/Automattic/wp-calypso/blob/master/client/state/README.md) for more details), we make sure to initialize the relevant portion of state by importing its `init` module. This is best handled in a dedicated selector module, rather than in individual connected components.

You'll note in the example above that the entire `state` object is passed to the selector. We've chosen to standardize on always sending the entire state object to any selector as the first parameter. This consistency should alleviate uncertainty in calling selectors, as you can always assume that it'll have a similar argument signature. More importantly, it's not uncommon for selectors to need to traverse different parts of the global state, as in the example above where we pull from both the `sites` and `posts` top-level state keys.

Following the modularized state approach, we've defined that the best practice is to place selectors for a given portion of state under its `state/{ subject }` directory, in a `selectors` file or directory. This keeps everything related to a given portion of state colocated. Selectors that touch multiple parts of state should live under `state/selectors`, reflecting their global nature.

It's important that selectors always be pure functions, meaning that the function should always return the same result when passed identical arguments in sequence. There should be no side-effects of calling a selector. For example, in a selector you should never trigger an AJAX request or assign values to variables defined outside the scope of the function.

What are a few common use-cases for selectors?

- Resolving references: A [normalized state tree](#data-normalization) is ideal from the standpoint of minimizing redundancy and synchronization concerns, but is not as developer-friendly to use. Selectors can be helpful in restoring convenient access to useful objects.
- Derived data: A normalized state tree avoids storing duplicated data. However, it can be useful to request a value which is calculated based on state data. For example, it might be valuable to retrieve the hostname for a site, which can be calculated based on its URL property.
- Filtering data: You can use a selector to return a subset of a state tree value. For example, a `getJetpackSites` selector could return an array of all known sites filtered to only those which are Jetpack-enabled.
 - __Side-note:__ In this case, you could achieve a similar effect with a reducer function aggregating an array of Jetpack site IDs. If you were to take this route, you'd probably want a complementary selector anyways. Caching concerns on selectors can be overcome by using memoization techniques (for example, with Calypso's `lib/create-selector` or `lib/tree-select`).

### UI State

By now, you're hopefully convinced that a global application state can enable us to scale our application needs with regards to persisted data (sites, posts, comments, etc.). The store can also be used to track the state of the user interface, but it's important to distinguish when and why it's appropriate to use the Redux store over, say, a [React component's state](https://reactjs.org/docs/state-and-lifecycle.html).

We recommend that you only use the state tree to store user interface state when you know that the data being stored should be persisted between page views, or when it's to be used by distinct areas of the application on the same page. As an example, consider the currently selected site. When navigating between pages in the [_My Sites_](https://wordpress.com/stats) section, I'd expect that the selected site should not change. Additionally, many parts of the rendered application make use of selected site. For these reasons, it makes sense that the currently selected site be saved in the global state. By contrast, when I navigate to the Sharing page and expand one of the available sharing services, I don't have the same expectation that this interaction be preserved when I later leave and return to the page. In these cases, it might be more appropriate to use React state to track the expanded status of the component, local only to the current rendering context. Use your best judgment when considering whether to add to the global state, but don't feel compelled to avoid React state altogether.

Files related to global application user-interface state (such as sections and masterbar visibility) can be found in the [`client/state/ui` directory](../client/state/ui), whereas feature-specific UI state should be kept together with the rest of that feature's state sub-tree or as a separate top-level entry.

### Data Persistence

Persisting our Redux state to browser storage (IndexedDB) allows us to avoid completely rebuilding the
Redux tree from scratch on each page load and to display cached data in the UI (instead of placeholders)
while fetching the latest updates from the REST API is still in progress.

Information about this large topic is in a [dedicated document](./data-persistence.md)
