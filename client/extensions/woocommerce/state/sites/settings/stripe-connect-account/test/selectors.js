/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getIsDeauthorizing, getIsRequesting, getStripeConnectAccount } from '../selectors';

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

describe( 'selectors', () => {
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
} );
