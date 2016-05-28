/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getDomainsBySite,
	getDomainsBySiteId,
	isRequestingSiteDomains
} from '../selectors';

/**
 * Fixture data
 */
import {
	SITE_ID_FIRST as firstSiteId,
	SITE_ID_SECOND as secondSiteId,
	SITE_FIRST_DOMAINS as firstSiteDomains,
	getStateInstance
} from './fixture';

describe( 'selectors', () => {
	describe( '#getDomainsBySite()', () => {
		it( 'should return domains by site', () => {
			const state = getStateInstance();
			const domains = getDomainsBySite( state, { ID: firstSiteId } );
			expect( domains ).to.eql( firstSiteDomains );
		} );
	} );

	describe( '#getDomainsBySiteId()', () => {
		it( 'should return domains by site id', () => {
			const state = getStateInstance();
			const domains = getDomainsBySiteId( state, firstSiteId );
			expect( domains ).to.eql( firstSiteDomains );
		} );
	} );

	describe( '#isRequestingSiteDomains()', () => {
		it( 'should return true if we are fetching domains', () => {
			const state = getStateInstance();

			expect( isRequestingSiteDomains( state, firstSiteId ) ).to.equal( false );
			expect( isRequestingSiteDomains( state, secondSiteId ) ).to.equal( true );
			expect( isRequestingSiteDomains( state, 'unknown' ) ).to.equal( false );
		} );
	} );
} );
