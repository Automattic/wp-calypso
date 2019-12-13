/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
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
					eventbrite: {
						ID: 'eventbrite',
						jetpack_support: true,
						type: 'other',
						jetpack_module_required: 'publicize',
					},
				},
				isFetching: true,
			},
		},
	};

	describe( 'getKeyringServices()', () => {
		test( 'should return empty object if there are no services', () => {
			const services = getKeyringServices( defaultState );

			expect( services ).to.be.empty;
		} );

		test( 'should return the keyring services', () => {
			const services = getKeyringServices( activeState );

			expect( services ).to.eql( {
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
				eventbrite: {
					ID: 'eventbrite',
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

			expect( services ).to.be.empty;
		} );

		test( 'should return the keyring services with the correct type', () => {
			const services = getKeyringServicesByType( activeState, 'publicize' );

			expect( services ).to.eql( [
				{ ID: 'facebook', type: 'publicize', jetpack_support: true },
				{ ID: 'twitter', type: 'publicize', jetpack_support: true },
			] );
		} );
	} );

	describe( 'getKeyringServiceByName()', () => {
		test( 'should return false if there is no service', () => {
			const service = getKeyringServiceByName( defaultState, 'thingy' );

			expect( service ).to.be.false;
		} );

		test( 'should return the named keyring service', () => {
			const service = getKeyringServiceByName( activeState, 'eventbrite' );

			expect( service ).to.eql( activeState.sharing.services.items.eventbrite );
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
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						name: 'WordPress.com Example Blog',
						URL: 'https://example.com',
						options: {
							unmapped_url: 'https://example.wordpress.com',
							active_modules: [ 'publicize' ],
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

			expect( services ).to.eql( [] );
		} );

		test( 'should return the keyring services with the correct type', () => {
			const services = getEligibleKeyringServices( state, 2916284, 'publicize' );

			expect( services ).to.eql( [
				{ ID: 'facebook', type: 'publicize', jetpack_support: true },
				{ ID: 'twitter', type: 'publicize', jetpack_support: true },
			] );
		} );

		test( 'should omit eventbrite if user can not manage_options', () => {
			state.currentUser.capabilities[ 2916284 ].manage_options = false;
			const services = getEligibleKeyringServices( state, 2916284, 'other' );
			state.currentUser.capabilities[ 2916284 ].manage_options = true;

			expect( services ).to.eql( [] );
		} );

		test( 'should omit publicize services if user can not publish_posts', () => {
			state.currentUser.capabilities[ 2916284 ].publish_posts = false;
			const services = getEligibleKeyringServices( state, 2916284, 'publicize' );
			state.currentUser.capabilities[ 2916284 ].publish_posts = true;

			expect( services ).to.eql( [] );
		} );

		test( 'should include services if required module is activated', () => {
			const services = getEligibleKeyringServices( state, 2916284, 'other' );

			expect( services ).to.eql( [
				{
					ID: 'eventbrite',
					jetpack_support: true,
					jetpack_module_required: 'publicize',
					type: 'other',
				},
			] );
		} );

		test( 'should omit services if required module is not activated', () => {
			state.sites.items[ 2916284 ].options.active_modules = [];
			const services = getEligibleKeyringServices( state, 2916284, 'other' );
			state.sites.items[ 2916284 ].options.active_modules = [ 'publicize' ];

			expect( services ).to.eql( [] );
		} );
	} );

	describe( 'isKeyringServicesFetching()', () => {
		test( 'should return false if there are no services', () => {
			const isRequesting = isKeyringServicesFetching( defaultState );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return true if a request is in progress for the site', () => {
			const isRequesting = isKeyringServicesFetching( activeState );

			expect( isRequesting ).to.be.true;
		} );

		test( 'should return false if a request has completed for the site', () => {
			const isRequesting = isKeyringServicesFetching( {
				sharing: {
					services: {
						isFetching: false,
					},
				},
			} );

			expect( isRequesting ).to.be.false;
		} );
	} );
} );
