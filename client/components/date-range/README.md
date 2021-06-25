# DateRange

A DateRange component for displaying and selecting a range of dates using a picker and form inputs. Comes with built-in trigger button and popover.

## Usage

First, display a `jsx` code block to show an example of usage, including import statements and a React component.

```jsx
import DateRange from 'calypso/components/date-range';

export default class extends React.Component {
	render() {
		return <DateRange />;
	}
}
```

Please refers to the examples for common usage patterns.

### Props

Props are displayed as a table with Name, Type, Default, and Description as headings.

**Required props are marked with `*`.**

| Name                                        | Type                        | Default             | Description                                                                                                                                                                                        |
| ------------------------------------------- | --------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selectedStartDate`                         | `Date` or `Moment` instance | today minus 1 month | the first day of the range you wish to be _pre-selected_ by _default_ in the date picker UI                                                                                                        |
| `selectedEndDate`                           | `Date` or `Moment` instance | today               | the last day of the range you wish to be _pre-selected_ by _default_ in the date picker UI                                                                                                         |
| `firstSelectableDate`                       | `Date` or `Moment` instance | `undefined`         | the first day of the date range that you want the user to be able to choose from                                                                                                                   |
| `lastSelectableDate`                        | `Date` or `Moment` instance | `undefined`         | the last day of the date range that you want the user to be able to choose from                                                                                                                    |
| `isCompact`                                 | `Boolean`                   | `false`             | determines whether the component trigger is rendered using a `compact` layout. If you require additional control over the trigger it is suggested to utilise one of the render prop overides below |
| `onDateCommit(startDate, endDate)`          | `Function`                  | `undefined`         | callback function called when a date is _committed_ (ie: "Applied").                                                                                                                               |
| `onDateSelect(startDate, endDate)`          | `Function`                  | `undefined`         | callback function called when a date is _selected_ (but not committed ie: "Applied")                                                                                                               |
| `triggerText( startDateText, endDateText )` | `Function`                  | `undefined`         | function to generate the text displayed in the trigger button. Passed the start/end date text in `MM/DD/YYYY` format (or locale specific alternative)                                              |

#### Render Props

These props utilise the [Render Props](https://reactjs.org/docs/render-props.html) pattern to allow consumers to overide the rendering of key parts of the `DateRange` UI.

| Name                   | Type       | Default   | Description                                                                                                                                   |
| ---------------------- | ---------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `renderTrigger(props)` | `Function` | undefined | render prop `Function` which will overide the default `DateRangeTrigger` component. Recieves same `props` object passed to `DateRangeTrigger` |
| `renderHeader(props)`  | `Function` | undefined | render prop `Function` which will overide the default `DateRangeHeader` component. Recieves same `props` object passed to `DateRangeHeader`   |
| `renderInputs(props)`  | `Function` | undefined | render prop `Function` which will overide the default `DateRangeInputs` component. Recieves same `props` object passed to `DateRangeInputs`   |

### General guidelines

General guidelines should be a list of tips and best practices. Example:

- To access the date data from outside the component utilise the `onDateCommit` and `onDateSelect` callback methods to trigger state updates in your parent component.
- If you need to heavily customise the look and feel consider using one of the render prop overides to customise the appropriate aspect.
- You can restrict the picker to certain date ranges using either/both of the `firstSelectableDate` and `lastSelectableDate` props to define a restriction.
- The underlying `DatePicker` uses [React Day Picker](http://react-day-picker.js.org/)/
- By default the layout will switch to a single calendar view at screens smaller than <480px

## Related components

This is an unordered list of components that are related in some way. Components are linked to the detail page of that component. Example:

- The [DatePicker](./date-picker) component provides the underlying date picker implementation.
