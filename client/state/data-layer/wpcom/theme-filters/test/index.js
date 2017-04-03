/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import { fetchThemeFilters } from '../';
import { receiveThemeFilters } from 'state/themes/actions';
import { THEME_FILTERS_REQUEST_FAILURE } from 'state/action-types';

describe( 'wpcom-api', () => {
	let dispatch;
	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	describe( 'theme filter request', () => {
		const filterData = {
			color: [ 'black', 'blue' ],
		};

		useNock( nock => (
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/theme-filters' )
				.reply( 200, filterData )
				.get( '/rest/v1.2/theme-filters' )
				.reply( 400, {} )
		) );

		it( 'should dispatch success action when request completes', () => {
			return fetchThemeFilters( { dispatch } )
				.then( () => {
					expect( dispatch ).to.have.been.calledWith( receiveThemeFilters( filterData ) );
				} );
		} );

		it( 'should dispatch failure action when request fails', () => {
			return fetchThemeFilters( { dispatch } )
				.then( () => {
					expect( dispatch ).to.have.been.calledWith( {
						type: THEME_FILTERS_REQUEST_FAILURE,
						error: sinon.match.truthy,
					} );
				} );
		} );
	} );
} );
