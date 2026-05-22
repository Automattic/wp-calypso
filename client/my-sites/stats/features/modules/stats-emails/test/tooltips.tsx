import { getClicksDisplayValue } from '../tooltips';

describe( 'getClicksDisplayValue', () => {
	it( 'shows total clicks when unique click data is unavailable', () => {
		expect(
			getClicksDisplayValue( {
				clicks: 5,
				unique_clicks: 0,
				clicks_rate: 0,
			} )
		).toBe( '5' );
	} );

	it( 'keeps showing click rate when unique click data is available', () => {
		expect(
			getClicksDisplayValue( {
				clicks: 10,
				unique_clicks: 5,
				clicks_rate: 50,
			} )
		).toBe( '50%' );
	} );

	it( 'shows a dash when there are no clicks', () => {
		expect(
			getClicksDisplayValue( {
				clicks: 0,
				unique_clicks: 0,
				clicks_rate: 0,
			} )
		).toBe( '—' );
	} );
} );
