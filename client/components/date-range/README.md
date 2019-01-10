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

#### Props

`onDateCommit(startDate, endDate)` - **optional** callback function called when a date is _committed_ (ie: "Applied"). 

`onDateSelect(startDate, endDate)` - **optional** callback function called when a date is _selected_ (but not committed ie: "Applied")

'firstSelectableDate' - **optional** `Date` object for the first day you wish to be selectable in the date picker (see examples)

'lastSelectableDate' - **optional** `Date` object for the last day you wish to be selectable in the date picker (see examples)
------------
