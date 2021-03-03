# Time Mismatch Warning

`TimeMismatchWarning` is a block that notifies users if there's a difference between their configured site timezone and their browser time. This is helpful to make users aware that events may appear to be the "incorrect" time and nudge them to fix the issue (if any).

Nothing will appear if we don't detect a discrepancy.

## How to use

```jsx
import TimeMismatchWarning from 'calypso/blocks/time-mismatch-warning';

const Test = () => (
	<>
		<TimeMismatchWarning siteId={ 1234 } />
		<ListWithTimes />
	</>
);
```

## Props

There are two props:

- `siteId`: Site ID to check.
- `settingsUrl`: Site settings URL. If unset defaults to current page.
- `status`: This is optional, and allows overriding the notice status. See the `Notice` component for allowed values.
