import {
	getKeyringServices,
	getKeyringServicesByType,
	getKeyringServiceByName,
	getEligibleKeyringServices,
	isKeyringServicesFetching,
} from '../selectors';

describe( 'selectors', () => {
	const defaultState = {
		sharing: {
			services: {
				items: {},
				isFetching: false,
			},
		},
		ui: { selectedSiteId: 0 },
	};
	const activeState = {
		sharing: {
			services: {
				items: {
					facebook: {
						ID: 'facebook',
						jetpack_support: true,
						type: 'publicize',
					},
					twitter: {
						ID: 'twitter',
						jetpack_support: true,
						type: 'publicize',
					},
					googlePhotos: {
						ID: 'google-photos',
						jetpack_support: true,
						jetpack_module_required: 'publicize',
						type: 'other',
					},
				},
				isFetching: true,
			},
		},
	};

	describe( 'getKeyringServices()', () => {
		test( 'should return empty object if there are no services', () => {
			const services = getKeyringServices( defaultState );

			expect( Object.keys( services ) ).toHaveLength( 0 );
		} );

		test( 'should return the keyring services', () => {
			const services = getKeyringServices( activeState );

			expect( services ).toEqual( {
				facebook: {
					ID: 'facebook',
					jetpack_support: true,
					type: 'publicize',
				},
				twitter: {
					ID: 'twitter',
					jetpack_support: true,
					type: 'publicize',
				},
				googlePhotos: {
					ID: 'google-photos',
					jetpack_support: true,
					jetpack_module_required: 'publicize',
					type: 'other',
				},
			} );
		} );
	} );

	describe( 'getKeyringServicesByType()', () => {
		test( 'should return empty object if there are no services', () => {
			const services = getKeyringServicesByType( defaultState, 'other' );

			expect( Object.keys( services ) ).toHaveLength( 0 );
		} );

		test( 'should return the keyring services with the correct type', () => {
			const services = getKeyringServicesByType( activeState, 'publicize' );

			expect( services ).toEqual( [
				{ ID: 'facebook', type: 'publicize', jetpack_support: true },
				{ ID: 'twitter', type: 'publicize', jetpack_support: true },
			] );
		} );
	} );

	describe( 'getKeyringServiceByName()', () => {
		test( 'should return false if there is no service', () => {
			const service = getKeyringServiceByName( defaultState, 'thingy' );

			expect( service ).toBe( false );
		} );

		test( 'should return the named keyring service', () => {
			const service = getKeyringServiceByName( activeState, 'facebook' );

			expect( service ).toEqual( activeState.sharing.services.items.facebook );
		} );
	} );

	describe( 'getEligibleKeyringServices()', () => {
		const state = {
			...activeState,
			currentUser: {
				capabilities: {
					2916284: {
						manage_options: true,
						publish_posts: true,
					},
				},
			},
			jetpack: {
				modules: {
					items: {
						2916284: {
							publicize: {
								active: true,
							},
						},
					},
				},
			},
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						name: 'WordPress.com Example Blog',
						URL: 'https://example.com',
						options: {
							unmapped_url: 'https://example.wordpress.com',
						},
						jetpack: true,
					},
				},
			},
			ui: {
				selectedSiteId: 2916284,
			},
		};

		test( 'should return empty object if there are no services', () => {
			const services = getEligibleKeyringServices( defaultState, 2916284, 'other' );

			expect( services ).toEqual( [] );
		} );

		test( 'should return the keyring services with the correct type', () => {
			const services = getEligibleKeyringServices( state, 2916284, 'publicize' );

			expect( services ).toEqual( [
				{ ID: 'facebook', type: 'publicize', jetpack_support: true },
				{ ID: 'twitter', type: 'publicize', jetpack_support: true },
			] );
		} );

		test( 'should omit publicize services if user can not publish_posts', () => {
			state.currentUser.capabilities[ 2916284 ].publish_posts = false;
			const services = getEligibleKeyringServices( state, 2916284, 'publicize' );
			state.currentUser.capabilities[ 2916284 ].publish_posts = true;

			expect( services ).toEqual( [] );
		} );

		test( 'should include services if required module is activated', () => {
			const services = getEligibleKeyringServices( state, 2916284, 'other' );
			expect( services ).toEqual( [
				{
					ID: 'google-photos',
					jetpack_support: true,
					jetpack_module_required: 'publicize',
					type: 'other',
				},
			] );
		} );

		test( 'should omit services if required module is not activated', () => {
			state.jetpack.modules.items[ 2916284 ].publicize.active = false;
			const services = getEligibleKeyringServices( state, 2916284, 'other' );
			state.jetpack.modules.items[ 2916284 ].publicize.active = true;

			expect( services ).toEqual( [] );
		} );
	} );

	describe( 'isKeyringServicesFetching()', () => {
		test( 'should return false if there are no services', () => {
			const isRequesting = isKeyringServicesFetching( defaultState );

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return true if a request is in progress for the site', () => {
			const isRequesting = isKeyringServicesFetching( activeState );

			expect( isRequesting ).toBe( true );
		} );

		test( 'should return false if a request has completed for the site', () => {
			const isRequesting = isKeyringServicesFetching( {
				sharing: {
					services: {
						isFetching: false,
					},
				},
			} );

			expect( isRequesting ).toBe( false );
		} );
	} );
} );
