/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isCalypsoStartedConnection, getFlowType } from '../selectors';

describe( 'selectors', () => {
	describe( '#isCalypsoStartedConnection()', () => {
		it( 'should return true if the user have started a session in calypso less than an hour ago', () => {
			const state = {
				jetpackConnectSessions: {
					sitetest: {
						timestamp: new Date( Date.now() - 59 * 60 * 1000 ).getTime(),
						flowType: ''
					}
				}
			};
			expect( isCalypsoStartedConnection( state.jetpackConnectSessions, 'sitetest' ) ).to.be.true;
		} );
		it( 'should return false if the user haven\'t started a session in calypso  ', () => {
			const state = {
				jetpackConnectSessions: {
					sitetest: {}
				}
			};
			expect( isCalypsoStartedConnection( state.jetpackConnectSessions, 'sitetest' ) ).to.be.false;
		} );

		it( 'should return false if the user started a session in calypso more than an hour ago', () => {
			const state = {
				jetpackConnectSessions: {
					sitetest: {
						timestamp: new Date( Date.now() - 60 * 60 * 1000 ).getTime(),
						flow: ''
					}
				}
			};
			expect( isCalypsoStartedConnection( state.jetpackConnectSessions, 'sitetest' ) ).to.be.false;
		} );
	} );
	describe( '#getFlowType()', () => {
		it( 'should return the flow of the session for a site', () => {
			const state = {
				jetpackConnectSessions: {
					sitetest: {
						timestamp: new Date( Date.now() - 59 * 60 * 1000 ).getTime(),
						flowType: 'pro'
					}
				}
			};
			expect( getFlowType( state.jetpackConnectSessions, { slug: 'sitetest' } ) ).to.eql( 'pro' );
		} );

		it( 'should return the false if there\'s no session for a site', () => {
			const state = {
				jetpackConnectSessions: {}
			};
			expect( getFlowType( state.jetpackConnectSessions, { slug: 'sitetest' } ) ).to.be.false;
		} );
	} );
} );

