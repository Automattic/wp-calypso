# Store Connection

Pass a component as a child of `<StoreConnection />`. `StoreConnection` will pass state to the given component, which is mounted as a child.
It will handle the data itself thus helping us to decouple concerns: i.e. fetching and displaying data. This pattern is also called [container components](https://medium.com/@learnreact/container-components-c0e67432e005).

## Usage

```js
<StoreConnection
	component={ MyComponent }
	stores={ stores }
	getStateFromStores={ getStateFromStores }
/>;
```

### Loading placeholder

It's possible to pass two properties to `<StoreConnection />` which will handle loading placeholder display:

- `isDataLoading` - function that gets state from stores and checks if data has loaded
- `loadingPlaceholder` - a component that is displayed until data has loaded

Based on return value from `isDataLoading` function call `<StoreConnection />` is going to display loading placeholder component passed or expected page component that contains all ready to use data.

Benefits of passing loading placeholder through `<StoreConnection />`:

- only once place to check if data has loaded, there is no need to repeat it in all page components
- we share data components between page components, by putting `isDataLoading` method in data component you can limit number of this method imports
- waiting until data is loaded often complicates page component lifecycle's handling, we can avoid conditional checks if data is initialised properly
- with loading logic moved away from page component we can also make assumption that all props are mandatory and reflect it in proper `React.PropType` setup
