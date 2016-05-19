/**
 * External Dependencies
 */
import noop from 'lodash/noop';

const hasWindow = typeof window !== 'undefined';

let olark = noop;

if ( hasWindow ) {
	olark = require( './vendor-olark' );
}
export default olark;
