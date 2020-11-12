# Interval

A React-oriented, declarative interval runner.

This component can be used to easily trigger a polling, looping, or interval action in the background. Such usages could include polling an API endpoint for updates, sweeping over user input such as in the post editor at intervals, or updating an on-screen timer.

It only requires two inputs: a callback to perform and an interval between which runs of the action should occur. The action is simply a function and the interval is a timeout in ms.
Notice how this interface closely matches `setInterval`.

## Usage

### `useInterval`

```tsx
import { useInterval, EVERY_MINUTE } from 'react';

function Counter() {
	const [ count, setCount ] = useState( 0 );

	useInterval( () => {
		setCount( count + 1 );
	}, EVERY_MINUTE );

	return <h1>Minutes: { count }</h1>;
}
```

### `<Interval />`

This is a Component wrapping `useInterval`, intended for use in classic React Components where hooks are unavailable.

```tsx
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';

<Interval onTick={ doSomething } period={ EVERY_FIVE_SECONDS } />;
```

#### Props

- `onTick`: Function to run on interval, _required_
- `period`: Constant specifying interval period, _required_
