Analytics: MC
=============

Automatticians may refer to internal documentation for more information about MC.

## Usage

### `bumpStat( group, name )`

Bump a single WP.com stat:

```js
import { bumpStat } from 'lib/analytics/mc';

bumpStat( 'newdash_visits', 'sites' );
```

### `bumpStat( obj )`

Bump multiple WP.com stats:

```js
import { bumpStat } from 'lib/analytics/mc';

bumpStat( {
	'stat_name1': 'stat_value1',
	'statname2': 'stat_value2'
} );
```
