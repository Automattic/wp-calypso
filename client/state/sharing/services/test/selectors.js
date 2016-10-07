/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getKeyringServices,
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
					facebook: { ID: 'facebook' },
					twitter: { ID: 'twitter' },
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
				facebook: { ID: 'facebook' },
				twitter: { ID: 'twitter' },
			} );
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
