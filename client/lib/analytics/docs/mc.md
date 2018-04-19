Analytics: MC
=============

Automatticians may refer to internal documentation for more information about MC.

## Usage

### `analytics.mc.bumpStat( group, name )`

Bump a single WP.com stat:

```js
analytics.mc.bumpStat( 'newdash_visits', 'sites' );
```

### `analytics.mc.bumpStat( obj )`

Bump multiple WP.com stats:

```js
analytics.mc.bumpStat( {
	'stat_name1': 'stat_value1',
	'statname2': 'stat_value2'
} );
```
