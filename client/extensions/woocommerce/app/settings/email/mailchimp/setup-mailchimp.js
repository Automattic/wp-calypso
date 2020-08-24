/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { pick, some, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { Dialog, ProgressBar } from '@automattic/components';
import { getSiteTitle } from 'state/sites/selectors';
import { getStoreLocation } from 'woocommerce/state/sites/settings/general/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';
import { getCurrentUserEmail } from 'state/current-user/selectors';
import getSiteTimezoneValue from 'state/selectors/get-site-timezone-value';
import {
	isSubmittingApiKey,
	isApiKeyCorrect,
	isSubmittingNewsletterSetting,
	isSubmittingStoreInfo,
} from 'woocommerce/state/sites/settings/mailchimp/selectors';
import KeyInputStep from './setup-steps/key-input.js';
import LogIntoMailchimp from './setup-steps/log-into-mailchimp.js';
import NewsletterSettings from './setup-steps/newsletter-settings.js';
import ProgressIndicator from 'components/wizard/progress-indicator';
import RequiredPluginsInstallView from 'woocommerce/app/dashboard/required-plugins-install-view';
import StoreInfoStep from './setup-steps/store-info.js';
import {
	submitMailChimpApiKey,
	submitMailChimpStoreInfo,
	submitMailChimpCampaignDefaults,
	submitMailChimpNewsletterSettings,
} from 'woocommerce/state/sites/settings/mailchimp/actions.js';

const LOG_INTO_MAILCHIMP_STEP = 'log_into';
const KEY_INPUT_STEP = 'key_input';
const STORE_INFO_STEP = 'store_info';
const CAMPAIGN_DEFAULTS_STEP = 'campaign_defaults';
const NEWSLETTER_SETTINGS_STEP = 'newsletter_settings';
const STORE_SYNC = 'sync';

const steps = {
	[ LOG_INTO_MAILCHIMP_STEP ]: { number: 0, nextStep: KEY_INPUT_STEP },
	[ KEY_INPUT_STEP ]: { number: 1, nextStep: STORE_INFO_STEP },
	[ STORE_INFO_STEP ]: { number: 2, nextStep: CAMPAIGN_DEFAULTS_STEP },
	// CAMPAIGN_DEFAULTS_STEP is also number 2 because it happens silently in the
	// background and the number here is used for UI purposes
	[ CAMPAIGN_DEFAULTS_STEP ]: { number: 2, nextStep: NEWSLETTER_SETTINGS_STEP },
	[ NEWSLETTER_SETTINGS_STEP ]: { number: 3, nextStep: STORE_SYNC },
	[ STORE_SYNC ]: { number: 4, nextStep: null },
};

const uiStepsCount = steps[ STORE_SYNC ].number + 1;

const storeSettingsRequiredFields = [
	'store_name',
	'store_street',
	'store_city',
	'store_state',
	'store_postal_code',
	'store_country',
	'store_phone',
	'store_locale',
	'store_timezone',
	'store_currency_code',
	'admin_email',
];

const campaignDefaultsRequiredFields = [
	'campaign_from_name',
	'campaign_from_email',
	'campaign_subject',
	'campaign_language',
	'campaign_permission_reminder',
];

class MailChimpSetup extends React.Component {
	constructor( props ) {
		super( props );
		// make this react to the real phase the execution is.
		this.state = {
			step: LOG_INTO_MAILCHIMP_STEP,
			settings: this.prepareDefaultValues( this.props ),
			settings_values_missing: false,
			input_field_has_changed: false,
			api_key_input: this.props.settings.mailchimp_api_key || '',
		};
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		// No state changes while doing request.
		if ( nextProps.isBusy ) {
			return;
		}

		const { active_tab } = nextProps.settings;
		if ( steps[ this.state.step ].nextStep === active_tab ) {
			const settings = this.prepareDefaultValues( nextProps );
			if ( active_tab === CAMPAIGN_DEFAULTS_STEP ) {
				// quickly to the next step
				// we want CAMPAIGN_DEFAULTS_STEP to happen in the background
				// we already have all the required information
				this.setState( { step: active_tab, settings }, this.next );
			} else {
				this.setState( { step: active_tab, settings } );
			}
			if ( active_tab === STORE_SYNC ) {
				nextProps.onClose( 'wizard-completed' );
			}
		}

		// Update settings if we have received lists
		if ( nextProps.settings.mailchimp_lists && ! this.props.settings.mailchimp_lists ) {
			const settings = this.prepareDefaultValues( nextProps );
			this.setState( { step: active_tab, settings } );
		}
	}

	prepareDefaultValues( nextProps ) {
		const { settings, translate } = nextProps;
		const newSettings = Object.assign( {}, settings );
		newSettings.campaign_from_name = settings.campaign_from_name || settings.store_name || '';
		newSettings.campaign_from_email = settings.campaign_from_email || settings.admin_email || '';
		newSettings.campaign_subject = settings.campaign_subject || settings.store_name || '';
		newSettings.store_locale = settings.store_locale || 'en';
		newSettings.campaign_language = settings.campaign_language || settings.store_locale;
		newSettings.campaign_permission_reminder =
			settings.campaign_permission_reminder ||
			translate( 'You were subscribed to the newsletter from %(store_name)s', {
				args: { store_name: settings.store_name },
			} );
		newSettings.admin_email = settings.admin_email || nextProps.currentUserEmail || '';
		newSettings.store_timezone =
			settings.store_timezone || nextProps.timezone || 'America/New_York';
		newSettings.store_name = settings.store_name || nextProps.siteTitle || '';
		newSettings.mailchimp_lists = settings.mailchimp_lists;
		newSettings.mailchimp_list = settings.mailchimp_list;
		return newSettings;
	}

	getStoreSettings = () => {
		// clear this and pass only what is required.
		const { address, currency } = this.props;

		const settings = pick( this.state.settings, storeSettingsRequiredFields );
		settings.store_city = address.city;
		settings.store_street = address.street + ' ' + address.street2;
		settings.store_state = address.state;
		settings.store_country = address.country;
		settings.store_postal_code = address.postcode;
		settings.store_currency_code = currency;
		return settings;
	};

	getCampaingDefaultsSettings = () => {
		return pick( this.state.settings, campaignDefaultsRequiredFields );
	};

	hasEmptyValues = ( data ) => {
		return some( data, isEmpty );
	};

	areStoreSettingsValid = ( settings ) => {
		const hasAllKeys = storeSettingsRequiredFields.every( ( key ) => key in settings );
		if ( ! hasAllKeys ) {
			return false;
		}
		if ( this.hasEmptyValues( settings ) ) {
			return false;
		}
		if ( settings.store_phone.length < 6 ) {
			return false;
		}

		return true;
	};

	areCampaignSettingsValid = ( settings ) => {
		const hasAllKeys = campaignDefaultsRequiredFields.every( ( key ) => key in settings );
		if ( ! hasAllKeys ) {
			return false;
		}
		if ( this.hasEmptyValues( settings ) ) {
			return false;
		}

		return true;
	};

	next = () => {
		const { step } = this.state;
		const { siteId } = this.props;

		if ( LOG_INTO_MAILCHIMP_STEP === step ) {
			this.setState( { step: steps[ this.state.step ].nextStep } );
		} else if ( step === KEY_INPUT_STEP ) {
			const validKey = !! this.state.api_key_input;
			this.setState( {
				settings_values_missing: ! validKey,
				input_field_has_changed: false,
			} );
			if ( validKey ) {
				this.props.submitMailChimpApiKey( siteId, this.state.api_key_input );
			}
		} else if ( STORE_INFO_STEP === step ) {
			const settings = this.getStoreSettings();
			const validSettings = this.areStoreSettingsValid( settings );
			this.setState( { settings_values_missing: ! validSettings } );
			if ( validSettings ) {
				this.props.submitMailChimpStoreInfo( siteId, settings );
			}
		} else if ( CAMPAIGN_DEFAULTS_STEP === step ) {
			const settings = this.getCampaingDefaultsSettings();
			const validSettings = this.areCampaignSettingsValid( settings );
			this.setState( { settings_values_missing: ! validSettings } );
			if ( validSettings ) {
				this.props.submitMailChimpCampaignDefaults( siteId, settings );
			}
		} else if ( NEWSLETTER_SETTINGS_STEP === step ) {
			const mailchimp_list = this.state.settings.mailchimp_list;
			this.setState( { settings_values_missing: ! mailchimp_list } );
			if ( mailchimp_list ) {
				this.props.submitMailChimpNewsletterSettings( siteId, { mailchimp_list } );
			}
		}
	};

	onKeyInputChange = ( e ) => {
		const value = e.target.value;
		this.setState( {
			api_key_input: value,
			settings_values_missing: false,
			input_field_has_changed: true,
		} );
	};

	// Right now Store info is combination of values from SettingsPaymentsLocationCurrency
	// and managed directly - not the greatest option but good for now.
	onStoreInfoChange = ( e ) => {
		this.setState( {
			settings: Object.assign( {}, this.state.settings, { [ e.target.name ]: e.target.value } ),
		} );
	};

	renderStep = () => {
		const { step, settings, settings_values_missing, input_field_has_changed } = this.state;
		const { isBusy } = this.props;
		if ( LOG_INTO_MAILCHIMP_STEP === step ) {
			return <LogIntoMailchimp />;
		}
		if ( KEY_INPUT_STEP === step ) {
			const keyCorrect =
				( this.props.isKeyCorrect || input_field_has_changed || isBusy ) &&
				! settings_values_missing;
			return (
				<KeyInputStep
					onChange={ this.onKeyInputChange }
					apiKey={ this.state.api_key_input }
					isKeyCorrect={ keyCorrect }
				/>
			);
		}
		// we show the same UI view for two steps because the
		// CAMPAIGN_DEFAULTS_STEP is executed silently in the background
		if ( STORE_INFO_STEP === step || CAMPAIGN_DEFAULTS_STEP === step ) {
			return (
				<StoreInfoStep
					onChange={ this.onStoreInfoChange }
					storeData={ settings }
					validateFields={ settings_values_missing }
				/>
			);
		}
		if ( NEWSLETTER_SETTINGS_STEP === step ) {
			return (
				<NewsletterSettings
					onChange={ this.onStoreInfoChange }
					storeData={ settings }
					validateFields={ settings_values_missing }
				/>
			);
		}
		return null;
	};

	render() {
		const { translate, hasMailChimp, siteId, isBusy } = this.props;
		const { step } = this.state;
		const isButtonBusy = isBusy ? 'is-busy' : '';
		const mainButton = {
			action: 'next',
			label: NEWSLETTER_SETTINGS_STEP === step ? translate( 'Sync' ) : translate( 'Next' ),
			onClick: this.next,
			isPrimary: true,
			additionalClassNames: isButtonBusy,
		};
		const buttons = [ { action: 'cancel', label: translate( 'Cancel' ) }, mainButton ];

		const dialogClass = 'woocommerce mailchimp__setup';
		const stepNum = steps[ step ].number;
		if ( ! hasMailChimp ) {
			return (
				<Dialog isVisible buttons={ null } className={ dialogClass }>
					<div className="mailchimp__setup-dialog-title">MailChimp</div>
					<RequiredPluginsInstallView site={ { ID: siteId } } skipConfirmation />
				</Dialog>
			);
		}

		if ( STORE_SYNC === step ) {
			return null;
		}

		return (
			<Dialog
				isVisible
				buttons={ buttons }
				onClose={ this.props.onClose }
				className={ dialogClass }
			>
				<div className="mailchimp__setup-dialog-progress">
					<ProgressBar value={ stepNum + 1 } total={ uiStepsCount } compact />
					<ProgressIndicator stepNumber={ stepNum } totalSteps={ uiStepsCount } />
				</div>
				<div className="mailchimp__setup-dialog-content">{ this.renderStep() }</div>
			</Dialog>
		);
	}
}

MailChimpSetup.propTypes = {
	address: PropTypes.object,
	currency: PropTypes.string,
	currentUserEmail: PropTypes.string,
	hasMailChimp: PropTypes.bool,
	isBusy: PropTypes.bool,
	isKeyCorrect: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	settings: PropTypes.object.isRequired,
	siteId: PropTypes.number.isRequired,
	submitMailChimpApiKey: PropTypes.func.isRequired,
	submitMailChimpCampaignDefaults: PropTypes.func.isRequired,
	submitMailChimpNewsletterSettings: PropTypes.func.isRequired,
	submitMailChimpStoreInfo: PropTypes.func.isRequired,
	timezone: PropTypes.string,
	siteTitle: PropTypes.string,
};

export default localize(
	connect(
		( state, { siteId } ) => {
			const isSavingApiKey = isSubmittingApiKey( state, siteId );
			const isSavingStoreInfo = isSubmittingStoreInfo( state, siteId );
			const isSavingNewsletterSettings = isSubmittingNewsletterSetting( state, siteId );
			const isKeyCorrect = isApiKeyCorrect( state, siteId );
			const address = getStoreLocation( state );
			const currency = getCurrencyWithEdits( state );
			const isBusy = isSavingApiKey || isSavingStoreInfo || isSavingNewsletterSettings;
			return {
				isBusy,
				address,
				currency,
				isKeyCorrect,
				siteTitle: getSiteTitle( state, siteId ),
				currentUserEmail: getCurrentUserEmail( state ),
				timezone: getSiteTimezoneValue( state, siteId ),
			};
		},
		{
			submitMailChimpApiKey,
			submitMailChimpStoreInfo,
			submitMailChimpCampaignDefaults,
			submitMailChimpNewsletterSettings,
		}
	)( MailChimpSetup )
);
