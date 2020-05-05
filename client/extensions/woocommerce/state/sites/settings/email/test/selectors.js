/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getEmailSettings,
	areEmailSettingsLoaded,
	areEmailSettingsLoading,
	emailSettingsSaveRequest,
	isSavingEmailSettings,
	emailSettingsSubmitSettingsError,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const preInitializedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						email: null,
					},
				},
			},
		},
	},
};

const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						email: LOADING,
					},
				},
			},
		},
	},
};

const saveRequestedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						email: { save: true },
					},
				},
			},
		},
	},
};

const currentlySavingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						email: { isSaving: true },
					},
				},
			},
		},
	},
};

const submitErrorState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						email: { error: 'Something is wrong!' },
					},
				},
			},
		},
	},
};

const data = [
	{
		id: 'woocommerce_email_from_name',
		value: '',
		group_id: 'email',
	},
	{
		id: 'woocommerce_email_from_address',
		value: 'test@test.com',
		group_id: 'email',
	},
	{
		id: 'enabled',
		value: 'yes',
		group_id: 'email_new_order',
	},
	{
		id: 'recipient',
		value: '',
		group_id: 'email_failed_order',
	},
	{
		id: 'enabled',
		value: 'yes',
		group_id: 'email_customer_on_hold_order',
	},
	{
		id: 'enabled',
		value: 'yes',
		group_id: 'email_customer_processing_order',
	},
];

const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						email: data,
					},
				},
			},
		},
	},
};

const loadingStateWithUi = { ...loadingState, ui: { selectedSiteId: 123 } };
const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areEmailSettingsLoaded', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areEmailSettingsLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when email settings are currently being fetched.', () => {
			expect( areEmailSettingsLoaded( loadingState, 123 ) ).to.be.false;
		} );

		test( 'should be true when products settings are loaded.', () => {
			expect( areEmailSettingsLoaded( loadedState, 123 ) ).to.be.true;
		} );

		test( 'should be false when products settings are loaded only for a different site.', () => {
			expect( areEmailSettingsLoaded( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areEmailSettingsLoaded( loadingStateWithUi ) ).to.be.false;
		} );
	} );

	describe( '#areEmailSettingsLoading', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areEmailSettingsLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when email settings are currently being fetched.', () => {
			expect( areEmailSettingsLoading( loadingState, 123 ) ).to.be.true;
		} );

		test( 'should be false when emails settings are loaded.', () => {
			expect( areEmailSettingsLoading( loadedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when emails settings are loaded only for a different site.', () => {
			expect( areEmailSettingsLoading( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areEmailSettingsLoading( loadingStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#getEmailSettings', () => {
		test( 'should be null  when woocommerce state is not available.', () => {
			expect( getEmailSettings( preInitializedState, 123 ) ).to.be.null;
		} );

		test( 'should get the email setting from the state.', () => {
			expect( getEmailSettings( loadedState, 123 ) ).to.eql( data );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getEmailSettings( loadedStateWithUi ) ).to.eql( data );
		} );
	} );

	describe( '#emailSettingsSaveRequest', () => {
		test( 'should be false when save settings request is not pending', () => {
			expect( emailSettingsSaveRequest( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when save settings request is pending - triggered by user "Save" button click', () => {
			expect( emailSettingsSaveRequest( saveRequestedState, 123 ) ).to.be.true;
		} );
	} );

	describe( '#isSavingEmailSettings', () => {
		test( 'should be false when settings are not currently being saved.', () => {
			expect( isSavingEmailSettings( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when settings are currently being saved.', () => {
			expect( isSavingEmailSettings( currentlySavingState, 123 ) ).to.be.true;
		} );
	} );

	describe( '#emailSettingsSubmitSettingsError', () => {
		test( 'should be false when no errors are logged.', () => {
			expect( emailSettingsSubmitSettingsError( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should equal error value when error is logged.', () => {
			expect( emailSettingsSubmitSettingsError( submitErrorState, 123 ) ).to.eql(
				'Something is wrong!'
			);
		} );
	} );
} );
