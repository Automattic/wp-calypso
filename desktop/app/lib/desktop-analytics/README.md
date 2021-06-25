# Desktop Analytics

Automatticians may refer to internal documentation for more information about MC.

## Usage

### `analytics.bumpStat( group, name )`

Bump a single WP.com stat:

```js
analytics.mc.bumpStat( 'newdash_visits', 'sites' );
```

### `analytics.bumpStat( obj )`

Bump multiple WP.com stats:

```js
analytics.mc.bumpStat( {
	stat_name1: 'stat_value1',
	statname2: 'stat_value2',
} );
```

### `analytics.sanitizeVersion( version )`

Sanitizes version string for analytics. To be used for e.g. bumpStat

```js
analytics.sanitizeVersion( '3.5.0-beta.1' ); // 3-5-0-beta-1
```

### `analytics.getPlatform( platform )`

Returns the analytics conform platform string for electrons `process.platform`

- `darwin`: osx
- `win32`: windows
- `linux`: linux

```js
const platform = process.platform; // darwin
analytics.getPlatform( platform ); // osx
```
