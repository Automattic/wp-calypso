Time Mismatch Warning
=====================

`TimeMismatchWarning` is a block that notifies users if there's a difference between their configured site timezone and their browser time. This is helpful to make users aware that events may appear to be the "incorrect" time and nudge them to fix the issue (if any).

Nothing will appear if we don't detect a discrepancy.

## How to use

```jsx
import TimeMismatchWarning from 'blocks/time-mismatch-warning';

const Test = () => (
	<>
		<TimeMismatchWarning />
		<ListWithTimes />
	</>
);
```

## Props
There is only one prop: `status`. This is optional, and allows overriding the notice status. See the `Notice` component for allowed values.
