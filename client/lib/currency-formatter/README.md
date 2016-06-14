Currency Formatter
==========
Given a currency code, this library will take in a number and display it as money correctly.

Also See: https://github.com/smirzaei/currency-formatter

Usage
==========
```javascript
import currencyFormatter from 'lib/currency-formatter';

const USD = currencyFormatter( 9800900.32, { code: 'USD' } ); // '$9,800,900.32'
const EUR = currencyFormatter( 9800900.32, { code: 'EUR' } ); // '9 800 900,32 €'
const JPY = currencyFormatter( 9800900.32, { code: 'JPY' } ); // '¥9,800,900'
```

## Option Properties

### `code`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The Currency Code

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

### `thousand`

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

### `format`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Use a custom format string eg. '%v %s' where %s is the symbol and %v is the value