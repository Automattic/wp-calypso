/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isAutomatticTeamMember } from '../';

describe( 'isAutomatticTeamMember', () => {
	test( 'should return true if teams include a8c', () => {
		expect( isAutomatticTeamMember( [ { slug: 'a8c' }, { slug: 'okapi' } ] ) ).to.be.true;
	} );

	test( 'should return false if teams do include a8c', () => {
		expect( isAutomatticTeamMember( [] ) ).to.be.false;
		expect( isAutomatticTeamMember( [ { slug: 'okapi' } ] ) ).to.be.false;
	} );
} );
