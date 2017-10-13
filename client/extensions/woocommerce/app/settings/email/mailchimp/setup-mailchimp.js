/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { pick, some, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Dialog from 'components/dialog';
import RequiredPluginsInstallView from 'woocommerce/app/dashboard/required-plugins-install-view';
import ProgressIndicator from 'components/wizard/progress-indicator';
import ProgressBar from 'components/progress-bar';
import {
	submitMailChimpApiKey,
	submitMailchimpStoreInfo,
	submitMailchimpCampaignDefaults,
	submitMailchimpNewsletterSettings
} from 'woocommerce/state/sites/settings/email/actions.js';
import { isSubbmittingApiKey, isApiKeyCorrect } from 'woocommerce/state/sites/settings/email/selectors';
import LogIntoMailchimp from './setup-steps/log-into-mailchimp.js';
import StoreInfoStep from './setup-steps/store-info.js';
import CampaignDefaultsStep from './setup-steps/campaign-defaults.js';
import NewsletterSettings from './setup-steps/newsletter-settings.js';
import KeyInputStep from './setup-steps/key-input.js';
import { getStoreLocation } from 'woocommerce/state/sites/settings/general/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';
import { getCurrentUserEmail } from 'state/current-user/selectors';
import { getSiteTimezoneValue } from 'state/selectors';

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
	[ CAMPAIGN_DEFAULTS_STEP ]: { number: 3, nextStep: NEWSLETTER_SETTINGS_STEP },
	[ NEWSLETTER_SETTINGS_STEP ]: { number: 4, nextStep: STORE_SYNC }
};

const storSettingsRequriredFields = [ 'store_name', 'store_street', 'store_city', 'store_state',
	'store_postal_code', 'store_country', 'store_phone', 'store_locale', 'store_timezone',
	'store_currency_code', 'admin_email' ];

const campaignDefaultsRequiredFields = [ 'campaign_from_name', 'campaign_from_email', 'campaign_subject',
		'campaign_language', 'campaign_permission_reminder' ];

class MailChimpSetup extends React.Component {

	constructor( props ) {
		super( props );
		// make this react to the real phase the execution is.
		this.state = {
			step: LOG_INTO_MAILCHIMP_STEP,
			settings: this.prepareDefaultValues( this.props.settings ),
			settings_values_missing: false,
			api_key_input: this.props.settings.mailchimp_api_key || '',
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.settings.mailchimp_lists && ! this.state.settings.mailchimp_lists ) {
			const newSettings = Object.assign( {}, this.state.settings );
			newSettings.mailchimp_lists = nextProps.settings.mailchimp_lists;
			newSettings.mailchimp_list = nextProps.settings.mailchimp_list;
			this.setState( { settings: newSettings } );
		}

		// No state changes while doing request.
		if ( nextProps.isBusy ) {
			return;
		}

		if ( ( nextProps.settings.active_tab === STORE_INFO_STEP ) &&
			( this.state.step === KEY_INPUT_STEP ) ) {
			this.setState( { step: STORE_INFO_STEP } );
			const settings = this.prepareDefaultValues( nextProps.settings );
			settings.admin_email = nextProps.settings.admin_email || nextProps.currentUserEmail || '';
			settings.store_timezone = nextProps.settings.store_timezone || nextProps.timezone || 'America/New_York';
			this.setState( { settings } );
		} else if ( ( nextProps.settings.active_tab === CAMPAIGN_DEFAULTS_STEP ) &&
			( this.state.step === STORE_INFO_STEP ) ) {
			this.setState( { step: CAMPAIGN_DEFAULTS_STEP } );
			this.setState( { settings: this.prepareDefaultValues( nextProps.settings ) } );
		} else if ( ( nextProps.settings.active_tab === NEWSLETTER_SETTINGS_STEP ) &&
			( this.state.step === CAMPAIGN_DEFAULTS_STEP ) ) {
			this.setState( { step: NEWSLETTER_SETTINGS_STEP } );
		} else if ( ( nextProps.settings.active_tab === STORE_SYNC ) &&
			( this.state.step === NEWSLETTER_SETTINGS_STEP ) ) {
			nextProps.onClose();
		}
	}

	prepareDefaultValues( settings ) {
		const newSettings = Object.assign( {}, settings );
		newSettings.campaign_from_name = settings.campaign_from_name || settings.store_name || '';
		newSettings.campaign_from_email = settings.campaign_from_email || settings.admin_email || '';
		newSettings.campaign_subject = settings.campaign_subject || settings.store_name || '';
		newSettings.store_locale = settings.store_locale || 'en';
		newSettings.campaign_language = settings.campaign_language || settings.store_locale;
		newSettings.campaign_permission_reminder = settings.campaign_permission_reminder ||
			'You were subscribed to the newsletter from ' + settings.store_name;
		return newSettings;
	}

	onClose = () => {
		this.props.onClose();
	}

	getStoreSettings = () => {
		// clear this and pass only what is required.
		const { address, currency } = this.props;

		const settings = pick( this.state.settings, storSettingsRequriredFields );
		settings.store_city = address.city;
		settings.store_street = address.street + ' ' + address.street2;
		settings.store_state = address.state;
		settings.store_country = address.country;
		settings.store_postal_code = address.postcode;
		settings.store_currency_code = currency;
		return settings;
	}

	getCampaingDefaultsSettings = () => {
		return pick( this.state.settings, campaignDefaultsRequiredFields );
	}

	hasEmptyValues = ( data ) => {
		return some( data, isEmpty );
	}

	areStoreSettingsValid = ( settings ) => {
		const hasAllKeys = storSettingsRequriredFields.every( key => key in settings );
		if ( ! hasAllKeys ) {
			return false;
		}
		const hasEmptyValues = this.hasEmptyValues( settings );
		if ( hasEmptyValues ) {
			return false;
		}
		if ( settings.store_phone.length <= 6 ) {
			return false;
		}

		return true;
	}

	areCampaignSettingsValid = ( settings ) => {
		const hasAllKeys = campaignDefaultsRequiredFields.every( key => key in settings );
		if ( ! hasAllKeys ) {
			return false;
		}
		return true;
	}

	next = () => {
		// Don't send data if it is not compleate or it is the same as the one we already had from
		// the endpoint.
		if ( this.state.step === KEY_INPUT_STEP ) {
			this.props.submitMailChimpApiKey( this.props.siteId, this.state.api_key_input );
			return;
		} else if ( this.state.step === STORE_INFO_STEP ) {
			const settings = this.getStoreSettings();
			const validSettings = this.areStoreSettingsValid( settings );
			if ( ! validSettings ) {
				this.setState( { settings_values_missing: true } );
				return;
			}
			this.setState( { settings_values_missing: false } );

			this.props.submitMailchimpStoreInfo( this.props.siteId, settings );
			return;
		} else if ( this.state.step === CAMPAIGN_DEFAULTS_STEP ) {
			const settings = this.getCampaingDefaultsSettings();
			const validSettings = this.areCampaignSettingsValid( settings );
			if ( ! validSettings ) {
				this.setState( { settings_values_missing: true } );
				return;
			}
			this.setState( { settings_values_missing: false } );
			this.props.submitMailchimpCampaignDefaults( this.props.siteId, settings );
			return;
		} else if ( this.state.step === NEWSLETTER_SETTINGS_STEP ) {
			const mailchimp_list = this.state.settings.mailchimp_list;
			if ( ! mailchimp_list ) {
				this.setState( { settings_values_missing: true } );
				return;
			}
			this.setState( { settings_values_missing: false } );
			this.props.submitMailchimpNewsletterSettings( this.props.siteId, { mailchimp_list } );
			return;
		}
		this.setState( { step: steps[ this.state.step ].nextStep } );
	}

	onKeyInputChange = ( e ) => {
		this.setState( { api_key_input: e.target.value } );
	}

	// Right now Store info is combination of values from SettingsPaymentsLocationCurrency
	// and managed directly - not the greatest option but good for now.
	onStoreInfoChange = ( e ) => {
		this.setState( { settings: Object.assign( {}, this.state.settings, { [ e.target.name ]: e.target.value } ) } );
	}

	renderStep = () => {
		const { step } = this.state;
		if ( step === LOG_INTO_MAILCHIMP_STEP ) {
			return <LogIntoMailchimp />;
		}
		if ( step === KEY_INPUT_STEP ) {
			return <KeyInputStep
				onChange={ this.onKeyInputChange }
				apiKey={ this.state.api_key_input }
				isKeyCorrect={ this.props.isKeyCorrect } />;
		}
		if ( step === STORE_INFO_STEP ) {
			return <StoreInfoStep
				onChange={ this.onStoreInfoChange }
				storeData={ this.state.settings }
				validateFields={ false }
			/>;
		}
		if ( step === CAMPAIGN_DEFAULTS_STEP ) {
			return <CampaignDefaultsStep
				onChange={ this.onStoreInfoChange }
				storeData={ this.state.settings }
				validateFields={ false }
			/>;
		}
		if ( step === NEWSLETTER_SETTINGS_STEP ) {
			return <NewsletterSettings
				onChange={ this.onStoreInfoChange }
				storeData={ this.state.settings }
				validateFields={ false }
			/>;
		}
		return <div></div>;
	}

	render() {
		const { translate, hasMailChimp, siteId } = this.props;
		const isButtonBusy = this.props.isBusy ? 'is-busy' : '';
		const buttons = [
			{ action: 'cancel', label: translate( 'Cancel' ) },
			{ action: 'next', label: translate( 'Next' ), onClick: this.next, isPrimary: true, additionalClassNames: isButtonBusy },
		];

		const dialogClass = 'woocommerce mailchimp__setup';
		const stepNum = steps[ this.state.step ].number;
		if ( ! hasMailChimp ) {
			return (
				<Dialog
					isVisible={ true }
					buttons={ null }
					className={ dialogClass }>
					<div className="mailchimp__setup-dialog-title">MailChimp</div>
					<RequiredPluginsInstallView
						site={ { ID: siteId } }
						skipConfirmation ={ true } />
				</Dialog>
			);
		}
		return (
				<Dialog
					isVisible={ true }
					buttons={ buttons }
					onClose={ this.onClose }
					className={ dialogClass }>
					<div className="mailchimp__setup-dialog-title">MailChimp</div>
					<ProgressBar
						value={ stepNum + 1 }
						total={ 5 }
						compact={ true } />
					<ProgressIndicator
						stepNumber={ stepNum }
						totalSteps={ 5 } />
						<div className="mailchimp__setup-dialog-content">
							{ this.renderStep() }
						</div>
				</Dialog>
		);
	}
}

export default localize( connect(
	( state, props ) => {
		const subbmittingApiKey = isSubbmittingApiKey( state, props.siteId );
		const isKeyCorrect = isApiKeyCorrect( state, props.siteId );
		const address = getStoreLocation( state );
		const currency = getCurrencyWithEdits( state );
		const isBusy = subbmittingApiKey;
		return {
			isBusy,
			address,
			currency,
			isKeyCorrect,
			currentUserEmail: getCurrentUserEmail( state ),
			timezone: getSiteTimezoneValue( state, props.siteId )
		};
	},
	{
		submitMailChimpApiKey,
		submitMailchimpStoreInfo,
		submitMailchimpCampaignDefaults,
		submitMailchimpNewsletterSettings
	}
)( MailChimpSetup ) );
