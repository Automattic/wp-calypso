DateRange
==========

React component used to display a Date Range.

---

## Example Usage

```js
import React from 'react';
import DateRange from 'components/date-range';

export default class extends React.Component {
	<DateRange />
}
```

---

## DateRange

### Props

* `selectedStartDate` - **optional** `Date|Moment` object for the first day of the range you wish to be selected by default in the date picker

* `selectedEndDate` - **optional** `Date|Moment` object for the last day of the range you wish to be selected by default in the date picker

* `firstSelectableDate` - **optional** `Date` object for the first day you wish to be selectable in the date picker (see examples)

* `lastSelectableDate` - **optional** `Date` object for the last day you wish to be selectable in the date picker (see examples)

* `onDateCommit(startDate, endDate)` - **optional** callback function called when a date is _committed_ (ie: "Applied"). 

* `onDateSelect(startDate, endDate)` - **optional** callback function called when a date is _selected_ (but not committed ie: "Applied")

* `numMonths()` - **optional** `Function` to be called on render which enables consumer to overide the function that determines whether the `DatePicker` component should display its `1` or `2` month view. By default this uses `matchMedia` to test on a screen size of `480px` with smaller screens getting the single month view.



#### Render Props

These props utilise the [Render Props](https://reactjs.org/docs/render-props.html) pattern to allow consumers to overide the rendering of key parts of the `DateRange` UI.

* `renderTrigger(props)` - **optional** render prop `Function` which will overide the default `DateRangeTrigger` component. Recieves same `props` object passed to `DateRangeTrigger`

* `renderHeader(props)` - **optional** render prop `Function` which will overide the default `DateRangeHeader` component. Recieves same `props` object passed to `DateRangeHeader`

* `renderInputs(props)` - **optional** render prop `Function` which will overide the default `DateRangeInputs` component. Recieves same `props` object passed to `DateRangeInputs`

------------
