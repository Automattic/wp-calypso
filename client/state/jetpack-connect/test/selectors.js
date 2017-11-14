/** @format */
/**
 * Internal dependencies
 */
import {
	getAuthAttempts,
	getAuthorizationData,
	getAuthorizationRemoteQueryData,
	getAuthorizationRemoteSite,
	getConnectingSite,
	getFlowType,
	getJetpackSiteByUrl,
	getSessions,
	getSiteIdFromQueryObject,
	getSSO,
	getUserAlreadyConnected,
	hasExpiredSecretError,
	hasXmlrpcError,
	isCalypsoStartedConnection,
	isRedirectingToWpAdmin,
	isRemoteSiteOnSitesList,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getConnectingSite()', () => {
		test( 'should return undefined if user has not started connecting a site', () => {
			const state = {
				jetpackConnect: {},
			};

			expect( getConnectingSite( state ) ).toBeUndefined();
		} );

		test( 'should return the current connecting site if there is such', () => {
			const jetpackConnectSite = {
				url: '',
				isFetching: true,
				isFetched: false,
				isRedirecting: false,
				installConfirmedByUser: true,
				isDismissed: false,
				data: {
					isDotCom: false,
					notExists: false,
					notWordPress: false,
					notJetpack: false,
					jetpackVersion: '4.3.1',
					outdatedJetpack: false,
					notActiveJetpack: false,
					notConnectedJetpack: true,
					alreadyOwned: true,
					alreadyConnected: false,
				},
			};
			const state = {
				jetpackConnect: {
					jetpackConnectSite,
				},
			};

			expect( getConnectingSite( state ) ).toEqual( jetpackConnectSite );
		} );
	} );

	describe( '#getAuthorizationData()', () => {
		test( 'should return undefined if user has not started the authorization flow', () => {
			const state = {
				jetpackConnect: {},
			};

			expect( getAuthorizationData( state ) ).toBeUndefined();
		} );

		test( 'should return the current authorization object if there is such', () => {
			const jetpackConnectAuthorize = {
				authorizationCode: 'abcdefgh12345678',
				isAuthorizing: false,
				queryObject: {},
			};
			const state = {
				jetpackConnect: {
					jetpackConnectAuthorize,
				},
			};

			expect( getAuthorizationData( state ) ).toEqual( jetpackConnectAuthorize );
		} );
	} );

	describe( '#getAuthorizationRemoteQueryData()', () => {
		test( 'should return undefined if user has not started the authorization flow', () => {
			const state = {
				jetpackConnect: {},
			};

			expect( getAuthorizationRemoteQueryData( state ) ).toBeUndefined();
		} );

		test( 'should return the current authorization query object if there is such', () => {
			const queryObject = {
				_wp_nonce: 'nonce',
				client_id: '12345678',
				redirect_uri: 'https://wordpress.com/',
				scope: 'auth',
				secret: '1234abcd',
				state: 12345678,
			};
			const state = {
				jetpackConnect: {
					jetpackConnectAuthorize: {
						queryObject,
					},
				},
			};

			expect( getAuthorizationRemoteQueryData( state ) ).toEqual( queryObject );
		} );
	} );

	describe( '#isRemoteSiteOnSitesList()', () => {
		test( 'should return false if user has not started the authorization flow', () => {
			const state = {
				jetpackConnect: {},
			};

			expect( isRemoteSiteOnSitesList( state ) ).toBe( false );
		} );

		test( 'should return true if the site is in the sites list', () => {
			const state = {
				sites: {
					items: {
						12345678: {
							ID: 12345678,
							jetpack: true,
							URL: 'https://wordpress.com/',
						},
					},
				},
				jetpackConnect: {
					jetpackConnectAuthorize: {
						queryObject: {
							_wp_nonce: 'nonce',
							client_id: '12345678',
							redirect_uri: 'https://wordpress.com/',
							scope: 'auth',
							secret: '1234abcd',
							state: 12345678,
							site: 'https://wordpress.com/',
						},
					},
				},
			};

			expect( isRemoteSiteOnSitesList( state ) ).toBe( true );
		} );

		test( 'should return false if the site is in the sites list, but is not responding', () => {
			const state = {
				sites: {
					items: {
						12345678: {
							ID: 12345678,
							jetpack: true,
							URL: 'https://wordpress.com/',
						},
					},
				},
				jetpackConnect: {
					jetpackConnectAuthorize: {
						queryObject: {
							client_id: '12345678',
						},
						clientNotResponding: true,
					},
				},
			};

			expect( isRemoteSiteOnSitesList( state ) ).toBe( false );
		} );
	} );

	describe( '#getAuthorizationRemoteSite()', () => {
		test( 'should return undefined if user has not started the authorization flow', () => {
			const state = {
				jetpackConnect: {},
			};

			expect( getAuthorizationRemoteSite( state ) ).toBeUndefined();
		} );

		test( 'should return the current authorization url if there is such', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectAuthorize: {
						queryObject: {
							_wp_nonce: 'nonce',
							client_id: '12345678',
							redirect_uri: 'https://wordpress.com/',
							scope: 'auth',
							secret: '1234abcd',
							state: 12345678,
							site: 'https://wordpress.com/',
						},
					},
				},
			};

			expect( getAuthorizationRemoteSite( state ) ).toEqual(
				state.jetpackConnect.jetpackConnectAuthorize.queryObject.site
			);
		} );
	} );

	describe( '#getSessions()', () => {
		test( 'should return undefined if user has not started any jetpack connect sessions', () => {
			const state = {
				jetpackConnect: {},
			};

			expect( getSessions( state ) ).toBeUndefined();
		} );

		test( "should return all of the user's single sign-on sessions", () => {
			const jetpackConnectSessions = {
				'wordpress.com': {
					timestamp: 1234567890,
					flowType: 'premium',
				},
				'jetpack.me': {
					timestamp: 2345678901,
					flowType: 'pro',
				},
			};
			const state = {
				jetpackConnect: {
					jetpackConnectSessions,
				},
			};

			expect( getSessions( state ) ).toEqual( jetpackConnectSessions );
		} );
	} );

	describe( '#getSSO()', () => {
		test( 'should return undefined if user has not yet started the single sign-on flow', () => {
			const state = {
				jetpackConnect: {},
			};

			expect( getSSO( state ) ).toBeUndefined();
		} );

		test( 'should return the current state of the single sign-on object', () => {
			const jetpackSSO = {
				ssoUrl: 'https://wordpress.com/',
				isAuthorizing: false,
				isValidating: false,
				nonceValid: true,
				authorizationError: false,
				validationError: false,
				blogDetails: {
					URL: 'https://wordpress.com/',
					admin_url: 'https://wordpress.com/wp-admin/',
					domain: 'wordpress.com',
					icon: {
						img: 'https://wordpress.com/example.jpg',
						ico: 'https://wordpress.com/example.ico',
					},
					title: 'Example Site Title',
				},
				sharedDetails: {
					ID: 1234,
					login: 'test',
					email: 'test@wordpress.com',
					url: 'https://wordpress.com',
					first_name: 'Example',
					last_name: 'Test',
					display_name: 'Example Test',
					description: 'User bio here',
					two_step_enabled: false,
					external_user_id: 1,
				},
			};
			const state = {
				jetpackConnect: {
					jetpackSSO,
				},
			};

			expect( getSSO( state ) ).toEqual( jetpackSSO );
		} );
	} );

	describe( '#isCalypsoStartedConnection()', () => {
		test( 'should return true if the user have started a session in calypso less than an hour ago', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectSessions: {
						sitetest: {
							timestamp: new Date( Date.now() - 59 * 60 * 1000 ).getTime(),
							flowType: '',
						},
					},
				},
			};

			expect( isCalypsoStartedConnection( state, 'sitetest' ) ).toBe( true );
		} );

		test( 'should return true if the user has just started a session in calypso and site contains a forward slash', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectSessions: {
						'example.com::example123': {
							timestamp: Date.now(),
							flow: '',
						},
					},
				},
			};

			expect( isCalypsoStartedConnection( state, 'example.com/example123' ) ).toBe( true );
		} );

		test( "should return false if the user haven't started a session in calypso  ", () => {
			const state = {
				jetpackConnect: {
					jetpackConnectSessions: {
						sitetest: {},
					},
				},
			};

			expect( isCalypsoStartedConnection( state, 'sitetest' ) ).toBe( false );
		} );

		test( 'should return false if the user started a session in calypso more than an hour ago', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectSessions: {
						sitetest: {
							timestamp: new Date( Date.now() - 60 * 60 * 1000 ).getTime(),
							flow: '',
						},
					},
				},
			};

			expect( isCalypsoStartedConnection( state, 'sitetest' ) ).toBe( false );
		} );
	} );

	describe( '#isRedirectingToWpAdmin()', () => {
		test( 'should return false if redirection flag is not set', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectAuthorize: {},
				},
			};

			expect( isRedirectingToWpAdmin( state ) ).toBe( false );
		} );

		test( 'should return false if redirection flag is set to false', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectAuthorize: {
						isRedirectingToWpAdmin: false,
					},
				},
			};

			expect( isRedirectingToWpAdmin( state ) ).toBe( false );
		} );

		test( 'should return true if redirection flag is set to true', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectAuthorize: {
						isRedirectingToWpAdmin: true,
					},
				},
			};

			expect( isRedirectingToWpAdmin( state ) ).toBe( true );
		} );
	} );

	describe( '#getFlowType()', () => {
		test( 'should return the flow of the session for a site', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectSessions: {
						sitetest: {
							timestamp: new Date( Date.now() - 59 * 60 * 1000 ).getTime(),
							flowType: 'pro',
						},
					},
				},
			};

			expect( getFlowType( state, 'sitetest' ) ).toEqual( 'pro' );
		} );

		test( 'should return the flow of the session for a site with slash in the site slug', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectSessions: {
						'example.com::example123': {
							timestamp: new Date( Date.now() - 59 * 60 * 1000 ).getTime(),
							flowType: 'pro',
						},
					},
				},
			};

			expect( getFlowType( state, 'example.com/example123' ) ).toEqual( 'pro' );
		} );

		test( "should return false if there's no session for a site", () => {
			const state = {
				jetpackConnect: {
					jetpackConnectSessions: {},
				},
			};

			expect( getFlowType( state, 'sitetest' ) ).toBe( false );
		} );
	} );

	describe( '#getJetpackSiteByUrl()', () => {
		test( 'should return null if site is not found', () => {
			const state = {
				sites: {
					items: {},
				},
			};

			expect( getJetpackSiteByUrl( state, 'example.wordpress.com' ) ).toBeNull();
		} );

		test( 'should return false if the site is not a jetpack site', () => {
			const state = {
				sites: {
					items: {
						12345678: {
							ID: 12345678,
							URL: 'https://example.wordpress.com/',
							jetpack: false,
						},
					},
				},
			};

			expect( getJetpackSiteByUrl( state, 'https://example.wordpress.com/' ) ).toBeNull();
		} );

		test( 'should return the site object if the site is a jetpack site', () => {
			const state = {
				sites: {
					items: {
						12345678: {
							ID: 12345678,
							URL: 'https://example.wordpress.com/',
							jetpack: true,
						},
					},
				},
			};

			expect( getJetpackSiteByUrl( state, 'https://example.wordpress.com/' ) ).toEqual(
				state.sites.items[ 12345678 ]
			);
		} );
	} );

	describe( '#hasXmlrpcError', () => {
		const stateHasXmlrpcError = {
			jetpackConnect: {
				jetpackConnectAuthorize: {
					authorizeError: {
						message: 'transport error - HTTP status code was not 200 (502)',
					},
					authorizationCode: 'xxxx',
				},
			},
		};

		const stateHasNoError = {
			jetpackConnect: {
				jetpackConnectAuthorize: {
					authorizeError: {
						message: '',
					},
				},
			},
		};

		const stateHasNoAuthorizationCode = {
			jetpackConnect: {
				jetpackConnectAuthorize: {
					authorizeError: {
						message: 'There was an error.',
					},
				},
			},
		};

		const stateHasOtherError = {
			jetpackConnect: {
				jetpackConnectAuthorize: {
					authorizeError: {
						message: 'Jetpack: [already_connected] User already connected.',
					},
					authorizationCode: 'xxxx',
				},
			},
		};

		test( 'should be false when there is an empty state', () => {
			const hasError = hasXmlrpcError( { jetpackConnect: {} } );
			expect( hasError ).toBe( false );
		} );

		test( 'should be false when there is no error', () => {
			const hasError = hasXmlrpcError( stateHasNoError );
			expect( hasError ).toBe( false );
		} );

		test( 'should be false when there is no authorization code', () => {
			// An authorization code is received during the jetpack.login portion of the connection
			// XMLRPC errors happen only during jetpack.authorize which only happens after jetpack.login is succesful
			const hasError = hasXmlrpcError( stateHasNoAuthorizationCode );
			expect( hasError ).toBe( false );
		} );

		test( 'should be false if a non-xmlrpc error is found', () => {
			// eg a user is already connected, or they've taken too long and their secret expired
			const hasError = hasXmlrpcError( stateHasOtherError );
			expect( hasError ).toBe( false );
		} );

		test( 'should be true if all the conditions are met', () => {
			const hasError = hasXmlrpcError( stateHasXmlrpcError );
			expect( hasError ).toBe( true );
		} );
	} );

	describe( '#hasExpiredSecretError', () => {
		const stateHasExpiredSecretError = {
			jetpackConnect: {
				jetpackConnectAuthorize: {
					authorizeError: {
						message: 'verify_secrets_expired',
					},
					authorizationCode: 'xxxx',
				},
			},
		};

		const stateHasNoError = {
			jetpackConnect: {
				jetpackConnectAuthorize: {
					authorizeError: false,
				},
			},
		};

		const stateHasNoAuthorizationCode = {
			jetpackConnect: {
				jetpackConnectAuthorize: {
					authorizeError: {
						message: 'An error message including "verify_secrets_expired".',
					},
				},
			},
		};

		const stateHasOtherError = {
			jetpackConnect: {
				jetpackConnectAuthorize: {
					authorizeError: {
						message: 'Jetpack: [already_connected] User already connected.',
					},
					authorizationCode: 'xxxx',
				},
			},
		};

		test( 'should be false when there is an empty state', () => {
			const hasError = hasExpiredSecretError( { jetpackConnect: {} } );
			expect( hasError ).toBe( false );
		} );

		test( 'should be false when there is no error', () => {
			const hasError = hasExpiredSecretError( stateHasNoError );
			expect( hasError ).toBe( false );
		} );

		test( 'should be false when there is no authorization code', () => {
			// An authorization code is received during the jetpack.login portion of the connection
			// Expired secret errors happen only during jetpack.authorize which only happens after jetpack.login is succesful
			const hasError = hasExpiredSecretError( stateHasNoAuthorizationCode );
			expect( hasError ).toBe( false );
		} );

		test( 'should be false if no expired secret error is found', () => {
			// eg a user is already connected, or they've taken too long and their secret expired
			const hasError = hasExpiredSecretError( stateHasOtherError );
			expect( hasError ).toBe( false );
		} );

		test( 'should be true if all the conditions are met', () => {
			const hasError = hasExpiredSecretError( stateHasExpiredSecretError );
			expect( hasError ).toBe( true );
		} );
	} );

	describe( '#getAuthAttempts()', () => {
		test( "should return 0 if there's no stored info for the site", () => {
			const state = {
				jetpackConnect: {
					jetpackAuthAttempts: {},
				},
			};

			expect( getAuthAttempts( state, 'sitetest.com' ) ).toBe( 0 );
		} );

		test( "should return 0 if there's stored info for the site, but it's stale", () => {
			const state = {
				jetpackConnect: {
					jetpackAuthAttempts: {
						'sitetest.com': {
							timestamp: 1,
							attempt: 2,
						},
					},
				},
			};

			expect( getAuthAttempts( state, 'sitetest.com' ) ).toBe( 0 );
		} );

		test( "should return the attempt number if there's stored info for the site, and it's not stale", () => {
			const state = {
				jetpackConnect: {
					jetpackAuthAttempts: {
						'sitetest.com': {
							timestamp: Date.now(),
							attempt: 2,
						},
					},
				},
			};

			expect( getAuthAttempts( state, 'sitetest.com' ) ).toBe( 2 );
		} );
	} );

	describe( '#getSiteIdFromQueryObject()', () => {
		test( 'should return an integer', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectAuthorize: {
						queryObject: {
							client_id: '123',
						},
					},
				},
			};
			expect( getSiteIdFromQueryObject( state ) ).toBe( 123 );
		} );

		test( 'should return null if there is no query object', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectAuthorize: {},
				},
			};
			expect( getSiteIdFromQueryObject( state ) ).toBeNull();
		} );

		test( 'should return null if there is no client id', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectAuthorize: {
						queryObject: {},
					},
				},
			};
			expect( getSiteIdFromQueryObject( state ) ).toBeNull();
		} );
	} );

	describe( '#getUserAlreadyConnected()', () => {
		const makeUserAlreadyConnectedState = result => ( {
			jetpackConnect: {
				jetpackConnectAuthorize: {
					userAlreadyConnected: result,
				},
			},
		} );

		test( 'should return false if state is missing', () => {
			expect( getUserAlreadyConnected( {} ) ).toBe( false );
		} );

		test( 'should return the value from state', () => {
			const falseState = makeUserAlreadyConnectedState( false );
			expect( getUserAlreadyConnected( falseState ) ).toBe( false );

			const trueState = makeUserAlreadyConnectedState( true );
			expect( getUserAlreadyConnected( trueState ) ).toBe( true );
		} );
	} );
} );
