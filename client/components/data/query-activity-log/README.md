Query Activity Log
==================

A query component for fetching activity log data.

## Usage

```
<QueryActivityLog siteId={ siteId } />
```

This component renders nothing. It ensures that any activity logs for the given site are available in global state.


## Props

### `siteId`

Type   | Required
------ | --------
Number | Yes

Site to fetch activities for.

### `dateEnd`

Type   | Required
------ | --------
Number | No

Unix millisecond timestamp to fetch activity on or before.

### `dateStart`

Type   | Required
------ | --------
Number | No

Unix millisecond timestamp to fetch activity on or after.

### `number`

Type   | Required | Default
------ | -------- | ---
Number | No       | 20

Number of results to fetch.
