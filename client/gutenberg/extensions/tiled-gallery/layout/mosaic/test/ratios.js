/**
 * Internal dependencies
 */
import { ratiosToMosaicRows } from '../ratios';
import { ratios } from './fixtures/ratios';

describe( 'ratiosToMosaicRows', () => {
	test( 'transforms as expected', () => {
		expect( ratiosToMosaicRows( ratios ) ).toMatchSnapshot();
	} );
} );
