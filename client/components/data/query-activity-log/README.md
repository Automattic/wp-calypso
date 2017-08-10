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

| Type     | Number |
| Required | Yes    |

Site to fetch activities for.

### `dateEnd`

| Type     | Number |
| Required | No     |

Unix millisecond timestamp to fetch activity on or before.

### `dateStart`

| Type     | Number |
| Required | No     |

Unix millisecond timestamp to fetch activity on or after.

### `number`

| Type     | Number |
| Required | No     |

Number of results to fetch.
