/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getIsRequesting, getStripeConnectAccount } from '../selectors';
import { getIsDisconnecting } from '../selectors';

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

const requestingState = {
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

const disconnectedState = {
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
							isDisconnecting: false,
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

		test( 'should be true when requesting account details.', () => {
			expect( getIsRequesting( requestingState, 123 ) ).to.be.true;
		} );

		test( 'should be false when not requesting account details.', () => {
			expect( getIsRequesting( fetchedState, 123 ) ).to.be.false;
		} );
	} );

	describe( '#getStripeConnectAccount', () => {
		test( 'should be empty when state is uninitialized.', () => {
			expect( getStripeConnectAccount( uninitializedState, 123 ) ).to.eql( {} );
		} );

		test( 'should return account details.', () => {
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

	describe( '#getIsDisconnecting', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( getIsDisconnecting( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when connected.', () => {
			expect( getIsDisconnecting( connectedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when disconnecting.', () => {
			expect( getIsDisconnecting( disconnectingState, 123 ) ).to.be.true;
		} );

		test( 'should be false when disconnected.', () => {
			expect( getIsDisconnecting( disconnectedState, 123 ) ).to.be.false;
		} );
	} );
} );
