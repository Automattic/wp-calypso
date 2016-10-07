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
	getEligibleKeyringServices,
	isKeyringServicesFetching,
} from '../selectors';

describe( 'selectors', () => {
	const defaultState = {
		sharing: {
			services: {
				items: {},
				isFetching: false,
			}
		}
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
						jetpack_module_required: true,
					},
				},
				isFetching: true,
			}
		}
	};

	describe( 'getKeyringServices()', () => {
		it( 'should return empty object if there are no services', () => {
			const services = getKeyringServices( defaultState );

			expect( services ).to.be.empty;
		} );

		it( 'should return the keyring services', () => {
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
					jetpack_module_required: true,
					type: 'other',
				},
			} );
		} );
	} );

	describe( 'getKeyringServicesByType()', () => {
		it( 'should return empty object if there are no services', () => {
			const services = getKeyringServicesByType( defaultState, 'other' );

			expect( services ).to.be.empty;
		} );

		it( 'should return the keyring services with the correct type', () => {
			const services = getKeyringServicesByType( activeState, 'publicize' );

			expect( services ).to.eql( [
				{ ID: 'facebook', type: 'publicize', jetpack_support: true },
				{ ID: 'twitter', type: 'publicize', jetpack_support: true },
			] );
		} );
	} );

	describe( 'getEligibleKeyringServices()', () => {
		let site = {
			capabilities: {
				manage_options: true,
				publish_posts: true
			},
			jetpack: true,
			isModuleActive: () => true,
		};

		it( 'should return empty object if there are no services', () => {
			const services = getEligibleKeyringServices( defaultState, site, 'other' );

			expect( services ).to.eql( [] );
		} );

		it( 'should return the keyring services with the correct type', () => {
			const services = getEligibleKeyringServices( activeState, site, 'publicize' );

			expect( services ).to.eql( [
				{ ID: 'facebook', type: 'publicize', jetpack_support: true },
				{ ID: 'twitter', type: 'publicize', jetpack_support: true },
			] );
		} );

		it( 'should omit eventbrite if user can not manage_options', () => {
			site.capabilities.manage_options = false;
			const services = getEligibleKeyringServices( activeState, site, 'other' );
			site.capabilities.manage_options = true;

			expect( services ).to.eql( [] );
		} );

		it( 'should omit publicize services if user can not publish_posts', () => {
			site.capabilities.publish_posts = false;
			const services = getEligibleKeyringServices( activeState, site, 'publicize' );
			site.capabilities.publish_posts = true;

			expect( services ).to.eql( [] );
		} );

		it( 'should include services if required module is activated', () => {
			const services = getEligibleKeyringServices( activeState, site, 'other' );

			expect( services ).to.eql( [
				{
					ID: 'eventbrite',
					jetpack_support: true,
					jetpack_module_required: true,
					type: 'other',
				}
			] );
		} );

		it( 'should omit services if required module is not activated', () => {
			site.isModuleActive = () => false;
			const services = getEligibleKeyringServices( activeState, site, 'other' );
			site.isModuleActive = () => true;

			expect( services ).to.eql( [] );
		} );
	} );

	describe( 'isKeyringServicesFetching()', () => {
		it( 'should return false if there are no services', () => {
			const isRequesting = isKeyringServicesFetching( defaultState );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if a request is in progress for the site', () => {
			const isRequesting = isKeyringServicesFetching( activeState );

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return false if a request has completed for the site', () => {
			const isRequesting = isKeyringServicesFetching( {
				sharing: {
					services: {
						isFetching: false,
					}
				}
			} );

			expect( isRequesting ).to.be.false;
		} );
	} );
} );
