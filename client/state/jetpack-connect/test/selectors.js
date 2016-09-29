/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isCalypsoStartedConnection, getFlowType, hasXmlrpcError } from '../selectors';

const stateHasXmlrpcError = {
	jetpackConnect: {
		jetpackConnectAuthorize: {
			authorizeError: {
				message: 'transport error - HTTP status code was not 200 (502)'
			},
			authorizationCode: 'xxxx'
		}
	}
};

const stateHasNoError = {
	jetpackConnect: {
		jetpackConnectAuthorize: {
			authorizeError: false
		}
	}
};

const stateHasNoAuthorizationCode = {
	jetpackConnect: {
		jetpackConnectAuthorize: {
			authorizeError: {
				message: 'Could not verify your request.'
			}
		}
	}
};

const stateHasOtherError = {
	jetpackConnect: {
		jetpackConnectAuthorize: {
			authorizeError: {
				message: 'Jetpack: [already_connected] User already connected.'
			},
			authorizationCode: 'xxxx'
		}
	}
};

describe( 'selectors', () => {
	describe( '#isCalypsoStartedConnection()', () => {
		it( 'should return true if the user have started a session in calypso less than an hour ago', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectSessions: {
						sitetest: {
							timestamp: new Date( Date.now() - 59 * 60 * 1000 ).getTime(),
							flowType: ''
						}
					}
				}
			};
			expect( isCalypsoStartedConnection( state, 'sitetest' ) ).to.be.true;
		} );
		it( 'should return false if the user haven\'t started a session in calypso  ', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectSessions: {
						sitetest: {}
					}
				}
			};
			expect( isCalypsoStartedConnection( state, 'sitetest' ) ).to.be.false;
		} );

		it( 'should return false if the user started a session in calypso more than an hour ago', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectSessions: {
						sitetest: {
							timestamp: new Date( Date.now() - 60 * 60 * 1000 ).getTime(),
							flow: ''
						}
					}
				}
			};
			expect( isCalypsoStartedConnection( state, 'sitetest' ) ).to.be.false;
		} );
	} );
	describe( '#getFlowType()', () => {
		it( 'should return the flow of the session for a site', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectSessions: {
						sitetest: {
							timestamp: new Date( Date.now() - 59 * 60 * 1000 ).getTime(),
							flowType: 'pro'
						}
					}
				}
			};
			expect( getFlowType( state, { slug: 'sitetest' } ) ).to.eql( 'pro' );
		} );

		it( 'should return the false if there\'s no session for a site', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectSessions: {}
				}
			};
			expect( getFlowType( state, { slug: 'sitetest' } ) ).to.be.false;
		} );
	} );
	describe( '#hasXmlrpcError', () => {
		it( 'should be undefined when there is an empty state', () => {
			const hasError = hasXmlrpcError( { jetpackConnect: {} } );
			expect( hasError ).to.be.undefined;
		} );
		it( 'should be false when there is no error', () => {
			const hasError = hasXmlrpcError( stateHasNoError );
			expect( hasError ).to.be.false;
		} );
		it( 'should be undefined when there is no authorization code', () => {
			// An authorization code is received during the jetpack.login portion of the connection
			// XMLRPC errors happen only during jetpack.authorize which only happens after jetpack.login is succesful
			const hasError = hasXmlrpcError( stateHasNoAuthorizationCode );
			expect( hasError ).to.be.undefined;
		} );
		it( 'should be false if a non-xmlrpc error is found', () => {
			// eg a user is already connected, or they've taken too long and their secret expired
			const hasError = hasXmlrpcError( stateHasOtherError );
			expect( hasError ).to.be.false;
		} );
		it( 'should be true if all the conditions are met', () => {
			const hasError = hasXmlrpcError( stateHasXmlrpcError );
			expect( hasError ).to.be.true;
		} );
	} );
} );
