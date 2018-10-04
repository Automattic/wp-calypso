Format Currency
==========
Given a currency code, this library will take in a number and display it as money correctly.

Usage
==========
```javascript
import formatCurrency from 'lib/format-currency';

const USD = formatCurrency( 9800900.32, 'USD' ); // '$9,800,900.32'
const EUR = formatCurrency( 9800900.32, 'EUR' ); // '€9.800.900,32'
const JPY = formatCurrency( 9800900.32, 'JPY' ); // '¥9,800,900'
```

Or

```javascript
import { getCurrencyObject } from 'lib/format-currency';
const USD = getCurrencyObject( 9800900.32, 'USD' ); // { symbol: '$', integer: '9,800,900', fraction: '.32', sign: '' }

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

The currency code to format with.

## Option Properties

### `symbol`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Overrides the currency symbol. Eg replacing 'A$' instead of '$'

### `decimal`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Overrides the decimal mark. eg: 9.99 vs 9,99

### `grouping`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>


Overrides the thousands symbol grouping.

### `precision`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The number of decimal places to display.
