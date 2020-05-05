/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getError,
	getIsCreating,
	getIsDeauthorizing,
	getIsOAuthConnecting,
	getIsOAuthInitializing,
	getIsRequesting,
	getNotifyCompleted,
	getOAuthURL,
	getStripeConnectAccount,
} from '../selectors';

const uninitializedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						stripeConnectAccount: {},
					},
				},
			},
		},
	},
};

const creatingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						stripeConnectAccount: {
							notifyCompleted: false,
							isCreating: true,
						},
					},
				},
			},
		},
	},
};

const createdState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						stripeConnectAccount: {
							connectedUserID: 'acct_14qyt6Alijdnw0EA',
							email: 'foo@bar.com',
							isCreating: false,
							notifyCompleted: true,
						},
					},
				},
			},
		},
	},
};

const errorState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						stripeConnectAccount: {
							error: 'My error message',
						},
					},
				},
			},
		},
	},
};

const fetchingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						stripeConnectAccount: {
							connectedUserID: '',
							displayName: '',
							email: '',
							firstName: '',
							isActivated: false,
							isDeauthorizing: false,
							isRequesting: true,
							lastName: '',
							logo: '',
						},
					},
				},
			},
		},
	},
};

const fetchedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						stripeConnectAccount: {
							connectedUserID: 'acct_14qyt6Alijdnw0EA',
							displayName: 'Foo Bar',
							email: 'foo@bar.com',
							firstName: 'Foo',
							isActivated: true,
							isDeauthorizing: false,
							isRequesting: false,
							lastName: 'Bar',
							logo: 'https://foo.com/bar.png',
						},
					},
				},
			},
		},
	},
};

const deauthorizingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						stripeConnectAccount: {
							connectedUserID: '',
							displayName: '',
							email: '',
							firstName: '',
							isActivated: false,
							isDeauthorizing: true,
							isRequesting: false,
							logo: '',
							lastName: '',
						},
					},
				},
			},
		},
	},
};

const deauthorizedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						stripeConnectAccount: {
							connectedUserID: '',
							displayName: '',
							email: '',
							firstName: '',
							isActivated: false,
							isDeauthorizing: false,
							isRequesting: false,
							logo: '',
							lastName: '',
						},
					},
				},
			},
		},
	},
};

const oauthInitializingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						stripeConnectAccount: {
							connectedUserID: '',
							displayName: '',
							email: '',
							firstName: '',
							isActivated: false,
							isDeauthorizing: false,
							isOAuthInitializing: true,
							isRequesting: false,
							logo: '',
							lastName: '',
							oauthUrl: '',
						},
					},
				},
			},
		},
	},
};

const oauthConnectingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						stripeConnectAccount: {
							connectedUserID: '',
							displayName: '',
							email: '',
							firstName: '',
							isActivated: false,
							isDeauthorizing: false,
							isOAuthInitializing: false,
							isOAuthConnecting: true,
							isRequesting: false,
							logo: '',
							lastName: '',
							oauthUrl: '',
							notifyCompleted: false,
						},
					},
				},
			},
		},
	},
};

const oauthConnectedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						stripeConnectAccount: {
							connectedUserID: 'acct_14qyt6Alijdnw0EA',
							displayName: '',
							email: '',
							firstName: '',
							isActivated: false,
							isDeauthorizing: false,
							isOAuthInitializing: false,
							isOAuthConnecting: false,
							isRequesting: false,
							logo: '',
							lastName: '',
							oauthUrl: '',
							notifyCompleted: true,
						},
					},
				},
			},
		},
	},
};

const oauthInitializedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						stripeConnectAccount: {
							connectedUserID: '',
							displayName: '',
							email: '',
							firstName: '',
							isActivated: false,
							isDeauthorizing: false,
							isOAuthInitializing: false,
							isRequesting: false,
							logo: '',
							lastName: '',
							oauthUrl: 'https://connect.stripe.com/oauth/authorize',
						},
					},
				},
			},
		},
	},
};

describe( 'selectors', () => {
	describe( '#getIsCreating', () => {
		test( 'should be false when state is uninitialized.', () => {
			expect( getIsCreating( uninitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when attempting to create an account.', () => {
			expect( getIsCreating( creatingState, 123 ) ).to.be.true;
		} );

		test( 'should be false after creating an account.', () => {
			expect( getIsCreating( createdState, 123 ) ).to.be.false;
		} );
	} );

	describe( '#getError', () => {
		test( 'should return error when present.', () => {
			expect( getError( errorState, 123 ) ).to.eql( 'My error message' );
		} );

		test( 'should return empty string when not.', () => {
			expect( getError( createdState, 123 ) ).to.eql( '' );
		} );
	} );

	describe( '#getNotifyCompleted', () => {
		test( 'should return false when account is being created.', () => {
			expect( getNotifyCompleted( creatingState, 123 ) ).to.eql( false );
		} );

		test( 'should return true after account has been created.', () => {
			expect( getNotifyCompleted( createdState, 123 ) ).to.eql( true );
		} );

		test( 'should return false when oauth is connecting.', () => {
			expect( getNotifyCompleted( oauthConnectingState, 123 ) ).to.eql( false );
		} );

		test( 'should return true when oauth has connected.', () => {
			expect( getNotifyCompleted( oauthConnectedState, 123 ) ).to.eql( true );
		} );
	} );

	describe( '#getIsRequesting', () => {
		test( 'should be false when state is uninitialized.', () => {
			expect( getIsRequesting( uninitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when fetching account details.', () => {
			expect( getIsRequesting( fetchingState, 123 ) ).to.be.true;
		} );

		test( 'should be false when not fetching account details.', () => {
			expect( getIsRequesting( fetchedState, 123 ) ).to.be.false;
		} );
	} );

	describe( '#getStripeConnectAccount', () => {
		test( 'should be empty when state is uninitialized.', () => {
			expect( getStripeConnectAccount( uninitializedState, 123 ) ).to.eql( {} );
		} );

		test( 'should return account details when they are available in state.', () => {
			expect( getStripeConnectAccount( fetchedState, 123 ) ).to.eql( {
				connectedUserID: 'acct_14qyt6Alijdnw0EA',
				displayName: 'Foo Bar',
				email: 'foo@bar.com',
				firstName: 'Foo',
				isActivated: true,
				lastName: 'Bar',
				logo: 'https://foo.com/bar.png',
			} );
		} );
	} );

	describe( '#getIsDeauthorizing', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( getIsDeauthorizing( uninitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when connected.', () => {
			expect( getIsDeauthorizing( fetchedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when deauthorizing.', () => {
			expect( getIsDeauthorizing( deauthorizingState, 123 ) ).to.be.true;
		} );

		test( 'should be false when deauthorization has completed.', () => {
			expect( getIsDeauthorizing( deauthorizedState, 123 ) ).to.be.false;
		} );
	} );

	describe( '#getIsOAuthInitializing', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( getIsOAuthInitializing( uninitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when initializing.', () => {
			expect( getIsOAuthInitializing( oauthInitializingState, 123 ) ).to.be.true;
		} );

		test( 'should be false when initialization has completed.', () => {
			expect( getIsOAuthInitializing( oauthInitializedState, 123 ) ).to.be.false;
		} );
	} );

	describe( '#getIsOAuthConnecting', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( getIsOAuthConnecting( uninitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when connecting.', () => {
			expect( getIsOAuthConnecting( oauthConnectingState, 123 ) ).to.be.true;
		} );

		test( 'should be false when connection has completed.', () => {
			expect( getIsOAuthConnecting( oauthConnectedState, 123 ) ).to.be.false;
		} );
	} );

	describe( '#getOAuthURL', () => {
		test( 'should be empty when woocommerce state is not available.', () => {
			expect( getOAuthURL( uninitializedState, 123 ) ).to.eql( '' );
		} );

		test( 'should be empty when initializing.', () => {
			expect( getOAuthURL( oauthInitializingState, 123 ) ).to.be.eql( '' );
		} );

		test( 'should have a URL when initialization has completed.', () => {
			expect( getOAuthURL( oauthInitializedState, 123 ) ).to.eql(
				'https://connect.stripe.com/oauth/authorize'
			);
		} );
	} );
} );
