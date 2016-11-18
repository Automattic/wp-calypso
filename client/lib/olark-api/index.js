/**
 * External Dependencies
 */
import noop from 'lodash/noop';

const hasWindow = typeof window !== 'undefined';

let olark = noop;

if ( hasWindow ) {
	const vendor = require( './vendor-olark' );
	olark = vendor( window );
}
export default olark;
