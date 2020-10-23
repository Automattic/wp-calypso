# Format Number Compact

Given a language code, this library will take in a number and display it in a compact format.

## Usage

```javascript
import formatNumberCompact from 'calypso/lib/format-number-compact';

const noChange = formatNumberCompact( 999, 'en' ); // '999'
const shortEn = formatNumberCompact( 1234, 'en' ); // '1.2K'
const shortEs = formatNumberCompact( 12567, 'es' ); // '12,6 mil'
```

## Parameters

### `number`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The number to format.

### `code`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The language code to format with.
