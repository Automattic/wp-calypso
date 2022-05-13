import config from '@automattic/calypso-config';
import isEligibleForUpworkSupport from 'calypso/state/selectors/is-eligible-for-upwork-support';

describe( 'isEligibleForUpworkSupport()', () => {
	test( 'returns false for `en` users and all sites have a free plan', () => {
		const state = {
			currentUser: { id: 1, user: { ID: 1, localeSlug: 'en' } },
			sites: {
				items: {
					111: { ID: 111 },
					222: { ID: 222 },
				},
				features: {
					111: { data: { active: [] } },
					222: { data: { active: [] } },
				},
			},
		};
		expect( isEligibleForUpworkSupport( state ) ).toBe( false );
	} );

	describe.each( config( 'upwork_support_locales' ) )( 'when locale %s', ( localeSlug ) => {
		test( 'returns true for users without higher support levels', () => {
			const state = {
				currentUser: { id: 1, user: { localeSlug } },
				sites: {
					items: {
						111: { ID: 111 },
						222: { ID: 222 },
					},
					features: {
						111: { data: { active: [ 'upwork-support' ] } },
						222: { data: { active: [] } },
					},
				},
			};
			expect( isEligibleForUpworkSupport( state ) ).toBe( true );
		} );

		test( 'returns false for users with higher support levels', () => {
			const state = {
				currentUser: { id: 1, user: { localeSlug } },
				sites: {
					items: {
						111: { ID: 111 },
						222: { ID: 222 },
					},
					features: {
						111: { data: { active: [ 'upwork-support' ] } },
						222: { data: { active: [ 'live-support' ] } },
					},
				},
			};
			expect( isEligibleForUpworkSupport( state ) ).toBe( false );
		} );
	} );
} );
