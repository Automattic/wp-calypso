/**
 * Internal dependencies
 */
import {
	getAuthAttempts,
	getAuthorizationData,
	getConnectingSite,
	getJetpackSiteByUrl,
	getSSO,
	getUserAlreadyConnected,
	hasExpiredSecretError,
	hasXmlrpcError,
	isRemoteSiteOnSitesList,
	isSiteBlacklistedError,
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

	describe( '#isRemoteSiteOnSitesList()', () => {
		test( 'should return false if user has not started the authorization flow', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectAuthorize: {},
				},
				sites: { items: {} },
			};

			expect( isRemoteSiteOnSitesList( state, 'https://wordpress.com' ) ).toBe( false );
		} );

		test( 'should return true if the site is in the sites list', () => {
			const state = {
				jetpackConnect: {
					jetpackConnectAuthorize: {},
				},
				sites: {
					items: {
						12345678: {
							ID: 12345678,
							jetpack: true,
							URL: 'https://wordpress.com',
						},
					},
				},
			};

			expect( isRemoteSiteOnSitesList( state, 'https://wordpress.com' ) ).toBe( true );
		} );

		test( 'should return false if the site is in the sites list, but is not responding', () => {
			const state = {
				sites: {
					items: {
						12345678: {
							ID: 12345678,
							jetpack: true,
							URL: 'https://wordpress.com',
						},
					},
				},
				jetpackConnect: {
					jetpackConnectAuthorize: {
						clientNotResponding: true,
					},
				},
			};

			expect( isRemoteSiteOnSitesList( state, 'https://wordpress.com' ) ).toBe( false );
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

	describe( '#isSiteBlacklistedError', () => {
		test( 'should be false when there is an empty state', () => {
			const hasError = isSiteBlacklistedError( { jetpackConnect: {} } );
			expect( hasError ).toBe( false );
		} );

		test( 'should be false when there is no error', () => {
			const stateHasNoError = {
				jetpackConnect: {
					jetpackConnectAuthorize: {
						authorizeError: false,
					},
				},
			};
			const hasError = isSiteBlacklistedError( stateHasNoError );
			expect( hasError ).toBe( false );
		} );

		test( 'should be false when there is another error', () => {
			const stateHasOtherError = {
				jetpackConnect: {
					jetpackConnectAuthorize: {
						authorizeError: {
							error: 'already_connected',
						},
					},
				},
			};
			const hasError = isSiteBlacklistedError( stateHasOtherError );
			expect( hasError ).toBe( false );
		} );

		test( 'should be true if site has been blacklisted', () => {
			const stateHasBeenBlacklistedError = {
				jetpackConnect: {
					jetpackConnectAuthorize: {
						authorizeError: {
							error: 'site_blacklisted',
						},
					},
				},
			};
			const hasError = isSiteBlacklistedError( stateHasBeenBlacklistedError );
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

	describe( '#getUserAlreadyConnected()', () => {
		const makeUserAlreadyConnectedState = ( result ) => ( {
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
