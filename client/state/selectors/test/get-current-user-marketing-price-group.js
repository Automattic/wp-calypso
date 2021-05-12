/**
 * Internal dependencies
 */
import getCurrentUserMarketingPriceGroup from 'calypso/state/selectors/get-current-user-marketing-price-group';

describe( 'getCurrentUserMarketingPriceGroup()', () => {
	test( 'should return null as default', () => {
		expect( getCurrentUserMarketingPriceGroup( {} ) ).toBeNull();
	} );

	test( 'should return the marketing price group value', () => {
		const marketingPriceGroup = 'Profit!';

		expect(
			getCurrentUserMarketingPriceGroup( {
				currentUser: {
					id: 12345,
					user: {
						meta: {
							marketing_price_group: marketingPriceGroup,
						},
					},
				},
			} )
		).toEqual( marketingPriceGroup );
	} );
} );
