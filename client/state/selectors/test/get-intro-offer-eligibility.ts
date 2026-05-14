import getIntroOfferEligibility from 'calypso/state/selectors/get-intro-offer-eligibility';

const buildState = ( introOfferOverrides = {} ) => ( {
	sites: {
		introOffers: {
			items: {
				12345: {
					2010: {
						productId: 2010,
						productSlug: 'jetpack_security_daily',
						currencyCode: 'USD',
						formattedPrice: '$149',
						rawPrice: 149,
						ineligibleReason: null,
						discountPercentage: 50,
						...introOfferOverrides,
					},
				},
			},
		},
	},
} );

describe( 'getIntroOfferEligibility()', () => {
	test( 'should return true when there are no ineligible reasons and content is not flagged', () => {
		const state = buildState();
		expect( getIntroOfferEligibility( state, 2010, 12345 ) ).toBe( true );
	} );

	test( 'should return false when ineligibleReason is a non-empty array', () => {
		const state = buildState( { ineligibleReason: [ 'introductory_offer_used' ] } );
		expect( getIntroOfferEligibility( state, 2010, 12345 ) ).toBe( false );
	} );

	test( 'should return false when isContentFlagged is true', () => {
		const state = buildState( { isContentFlagged: true } );
		expect( getIntroOfferEligibility( state, 2010, 12345 ) ).toBe( false );
	} );

	test( 'should return false when isContentFlagged is true even if ineligibleReason is null', () => {
		const state = buildState( { ineligibleReason: null, isContentFlagged: true } );
		expect( getIntroOfferEligibility( state, 2010, 12345 ) ).toBe( false );
	} );

	test( 'should return false when isContentFlagged is true even if ineligibleReason is empty', () => {
		const state = buildState( { ineligibleReason: [], isContentFlagged: true } );
		expect( getIntroOfferEligibility( state, 2010, 12345 ) ).toBe( false );
	} );

	test( 'should return true when isContentFlagged is false and ineligibleReason is null', () => {
		const state = buildState( { ineligibleReason: null, isContentFlagged: false } );
		expect( getIntroOfferEligibility( state, 2010, 12345 ) ).toBe( true );
	} );

	test( 'should return true when intro offer is not found', () => {
		const state = buildState();
		expect( getIntroOfferEligibility( state, 9999, 12345 ) ).toBe( true );
	} );
} );
