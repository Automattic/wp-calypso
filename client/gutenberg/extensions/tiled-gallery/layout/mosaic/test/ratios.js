/**
 * Internal dependencies
 */
import { ratiosToRows } from '../ratios';
import { ratios } from './fixtures/ratios';

describe( 'ratiosToRows', () => {
	test( 'transforms as expected', () => {
		expect( ratiosToRows( ratios ) ).toMatchSnapshot();
	} );
} );
