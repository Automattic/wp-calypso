# Interval

An interface into a global timer coalescing interval runner.

_**An interface**_ because this component handles registering and un-registering the given `onTick` action with the global runner.

_**timer coalescing**_ because the global runner will run at the same time all of the actions registered for a given interval period. For example, if four actions are registered for running once per minute, they will all run at one point in time every minute instead of having four different run times, each time repeating every minute. This is better for things like battery life because it allows for longer and deeper periods of sleep between actions.

_**interval runner**_ because the global runner will execute the given action every interval on the interval.

This component can be used to easily trigger a polling, looping, or interval action in the background. Such usages could include polling an API endpoint for updates, sweeping over user input such as in the post editor at intervals, or updating an on-screen timer.

It only requires two inputs: an action to perform and an interval between which runs of the action should occur. The action is simply a function and the interval is a named constant representing the interval period. These interval periods are intentionally limited to prevent sprawl of timers.

The action will only be executed as long as the React component is mounted, as the component un-registers the action on unmount. Additionally, the default behavior is to stop executing the action when the browser document is hidden, though this can be overwritten. "Hidden" means that another browser tab is selected or the browser is minimized.

Wrapped components will be transferred all additional props not consumed by the `<Interval />` itself.

## Usage

```jsx
import Interval, { EVERY_FIVE_SECONDS, EVERY_MINUTE } from 'lib/interval';

<Interval onTick={ doSomething } period={ EVERY_FIVE_SECONDS } />

// Wrapping a component
<Interval onTick={ fetchNewReaderPosts } period={ EVERY_MINUTE }>
	<Reader {...readerProps} />
</Interval>

// Wrapping passes down props
const CounterDisplay = counter => <div>{ counter }</div>;

<Interval onTick={ updateCounter } period={ EVERY_MINUTE } counter={ counter }>
	<CounterDisplay />
</Interval>
```

## Props

 - `onTick`: Function to run on interval, _required_
 - `period`: Constant specifying interval period, _required_
 - `pauseWhenHidden`: _[true]_ Boolean indicating whether or not to stop executing the action when the browser document is hidden from view.