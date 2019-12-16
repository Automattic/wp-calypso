/**
 * Internal dependencies
 */
import isEligibleForDotcomChecklist from '../is-eligible-for-dotcom-checklist';

describe( 'isEligibleForDotcomChecklist()', () => {
	test( 'should return false for simple sites without a created_at option', () => {
		const state = { sites: { items: { 99: { options: {} } } } };

		expect( isEligibleForDotcomChecklist( state, 99 ) ).toBe( false );
	} );

	test( 'should return false for unresolved sites', () => {
		expect( isEligibleForDotcomChecklist( { sites: [] }, 99 ) ).toBe( false );
	} );

	test( 'should return false for old sites', () => {
		const state = {
			sites: {
				items: {
					99: {
						options: {
							created_at: '2018-01-31',
						},
					},
				},
			},
		};

		expect( isEligibleForDotcomChecklist( state, 99 ) ).toBe( false );
	} );

	test( 'should return true for recent simple sites', () => {
		const state = {
			sites: {
				items: {
					99: {
						options: {
							created_at: '2018-02-01',
						},
					},
				},
			},
		};

		expect( isEligibleForDotcomChecklist( state, 99 ) ).toBe( true );
	} );

	test( 'should return true for recent AT sites', () => {
		const state = {
			sites: {
				items: {
					99: {
						options: {
							is_automated_transfer: '1',
							created_at: '2018-02-01',
						},
					},
				},
			},
		};

		expect( isEligibleForDotcomChecklist( state, 99 ) ).toBe( true );
	} );

	test( 'should return false for AT sites without a created_at option', () => {
		const state = {
			sites: {
				items: {
					99: {
						options: {
							is_automated_transfer: '1',
						},
					},
				},
			},
		};

		expect( isEligibleForDotcomChecklist( state, 99 ) ).toBe( false );
	} );

	test( 'should return false for recent non-atomic jetpack sites', () => {
		const state = {
			sites: {
				items: {
					99: {
						jetpack: true,
						options: {
							created_at: '2018-02-01',
						},
					},
				},
			},
		};

		expect( isEligibleForDotcomChecklist( state, 99 ) ).toBe( false );
	} );

	test( 'should return true for recent AT non-store sites', () => {
		const state = {
			sites: {
				items: {
					99: {
						jetpack: true,
						options: {
							created_at: '2018-02-01',
							is_automated_transfer: '1',
						},
					},
				},
			},
		};

		expect( isEligibleForDotcomChecklist( state, 99 ) ).toBe( true );
	} );

	test( 'should return true for recent AT store sites', () => {
		const state = {
			sites: {
				items: {
					99: {
						jetpack: true,
						options: {
							created_at: '2018-02-01',
							is_automated_transfer: '1',
							is_wpcom_store: '1',
						},
					},
				},
			},
		};

		expect( isEligibleForDotcomChecklist( state, 99 ) ).toBe( true );
	} );
} );
