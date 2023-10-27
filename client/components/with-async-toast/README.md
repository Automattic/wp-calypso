# With Async Toasts

`withAsyncToast` is a React higher-order component used in dispatching asynchronous toast notifications.

## Usage

The async toast API on wpcom returns a mapping from keys to messages. Pass an array of keys to `withAsyncToast`, and the wrapped component will now listen for toasts of the given keys and display them to the user.

```jsx
import withAsyncToast from 'calypso/components/with-async-toast';
import OtherComponent from './frobozz';

export const MyComponent =
	localize( withAsyncToast( { toastKeys: [ 'test-toast' ] } )( OtherComponent ) )
```

## Props

- `toastKeys: ToastKey[]`: Array of strings; these are the keys of the toasts this component should listen for.
