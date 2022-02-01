import isSiteEligibleForLegacyFSE from '../is-site-eligible-for-legacy-fse';

function getSitesState( siteData = {} ) {
	return {
		sites: {
			items: {
				123: {
					...siteData,
				},
			},
		},
	};
}

describe( 'isSiteEligibleForLegacyFSE', () => {
	test( 'returns false if site does not exist', () => {
		const state = { sites: { items: {} } };
		const isFSE = isSiteEligibleForLegacyFSE( state, 1 );
		expect( isFSE ).toBe( false );
	} );

	test( 'returns true if site exists, has is_fse_eligble set to true', () => {
		const state = getSitesState( { is_fse_eligible: true } );
		const isFSE = isSiteEligibleForLegacyFSE( state, 123 );
		expect( isFSE ).toBe( true );
	} );

	test( 'returns false if site exists, has is_fse_eligible set to false', () => {
		const state = getSitesState( { is_fse_eligible: false } );
		const isFSE = isSiteEligibleForLegacyFSE( state, 123 );
		expect( isFSE ).toBe( false );
	} );

	test( 'returns false if site exists, but has no is_fse_eligible prop', () => {
		const state = getSitesState();
		const isFSE = isSiteEligibleForLegacyFSE( state, 123 );
		expect( isFSE ).toBe( false );
	} );
} );
