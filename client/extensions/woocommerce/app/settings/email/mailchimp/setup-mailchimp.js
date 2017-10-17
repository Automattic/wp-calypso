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
import CampaignDefaultsStep from './setup-steps/campaign-defaults.js';
import Dialog from 'components/dialog';
import { getStoreLocation } from 'woocommerce/state/sites/settings/general/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';
import { getCurrentUserEmail } from 'state/current-user/selectors';
import { getSiteTimezoneValue } from 'state/selectors';
import { isSubbmittingApiKey, isApiKeyCorrect } from 'woocommerce/state/sites/settings/email/selectors';
import KeyInputStep from './setup-steps/key-input.js';
import LogIntoMailchimp from './setup-steps/log-into-mailchimp.js';
import NewsletterSettings from './setup-steps/newsletter-settings.js';
import ProgressBar from 'components/progress-bar';
import ProgressIndicator from 'components/wizard/progress-indicator';
import RequiredPluginsInstallView from 'woocommerce/app/dashboard/required-plugins-install-view';
import StoreInfoStep from './setup-steps/store-info.js';
import {
	submitMailChimpApiKey,
	submitMailChimpStoreInfo,
	submitMailChimpCampaignDefaults,
	submitMailChimpNewsletterSettings
} from 'woocommerce/state/sites/settings/email/actions.js';

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
	[ NEWSLETTER_SETTINGS_STEP ]: { number: 4, nextStep: STORE_SYNC },
	[ STORE_SYNC ]: { number: 5, nextStep: null },
};

const storeSettingsRequiredFields = [ 'store_name', 'store_street', 'store_city', 'store_state',
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
			settings: this.prepareDefaultValues( this.props ),
			settings_values_missing: false,
			api_key_input: this.props.settings.mailchimp_api_key || '',
		};
	}

	componentWillReceiveProps( nextProps ) {
		// No state changes while doing request.
		if ( nextProps.isBusy ) {
			return;
		}

		const { active_tab } = nextProps.settings;
		if ( steps[ this.state.step ].nextStep === active_tab ) {
			const settings = this.prepareDefaultValues( nextProps );
			this.setState( { step: active_tab, settings } );
			if ( active_tab === STORE_SYNC ) {
				nextProps.onClose();
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
		newSettings.campaign_permission_reminder = settings.campaign_permission_reminder ||
			translate( 'You were subscribed to the newsletter from %(store_name)s', {
				args: { store_name: settings.store_name, }
			} );
		newSettings.admin_email = settings.admin_email || nextProps.currentUserEmail || '';
		newSettings.store_timezone = settings.store_timezone || nextProps.timezone || 'America/New_York';
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
	}

	getCampaingDefaultsSettings = () => {
		return pick( this.state.settings, campaignDefaultsRequiredFields );
	}

	hasEmptyValues = ( data ) => {
		return some( data, isEmpty );
	}

	areStoreSettingsValid = ( settings ) => {
		const hasAllKeys = storeSettingsRequiredFields.every( key => key in settings );
		if ( ! hasAllKeys ) {
			return false;
		}
		if ( this.hasEmptyValues( settings ) ) {
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
		if ( this.hasEmptyValues( settings ) ) {
			return false;
		}

		return true;
	}

	next = () => {
		const { step } = this.state;
		const { siteId } = this.props;

		if ( LOG_INTO_MAILCHIMP_STEP === step ) {
			this.setState( { step: steps[ this.state.step ].nextStep } );
		} else if ( step === KEY_INPUT_STEP ) {
			const validKey = !! this.state.api_key_input;
			this.setState( { settings_values_missing: ! validKey } );
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
		const { step, settings, settings_values_missing } = this.state;
		if ( LOG_INTO_MAILCHIMP_STEP === step ) {
			return <LogIntoMailchimp />;
		}
		if ( KEY_INPUT_STEP === step ) {
			return <KeyInputStep
				onChange={ this.onKeyInputChange }
				apiKey={ this.state.api_key_input }
				isKeyCorrect={ this.props.isKeyCorrect && ! settings_values_missing } />;
		}
		if ( STORE_INFO_STEP === step ) {
			return <StoreInfoStep
				onChange={ this.onStoreInfoChange }
				storeData={ settings }
				validateFields={ settings_values_missing }
			/>;
		}
		if ( CAMPAIGN_DEFAULTS_STEP === step ) {
			return <CampaignDefaultsStep
				onChange={ this.onStoreInfoChange }
				storeData={ settings }
				validateFields={ settings_values_missing }
			/>;
		}
		if ( NEWSLETTER_SETTINGS_STEP === step ) {
			return <NewsletterSettings
				onChange={ this.onStoreInfoChange }
				storeData={ settings }
				validateFields={ settings_values_missing }
			/>;
		}
		return null;
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
					isVisible
					buttons={ null }
					className={ dialogClass }>
					<div className="mailchimp__setup-dialog-title">MailChimp</div>
					<RequiredPluginsInstallView
						site={ { ID: siteId } }
						skipConfirmation />
				</Dialog>
			);
		}

		if ( STORE_SYNC === this.state.step ) {
			return null;
		}

		return (
				<Dialog
					isVisible
					buttons={ buttons }
					onClose={ this.props.onClose }
					className={ dialogClass }>
					<div className="mailchimp__setup-dialog-title">MailChimp</div>
					<ProgressBar
						value={ stepNum + 1 }
						total={ steps.length }
						compact
					/>
					<ProgressIndicator
						stepNumber={ stepNum }
						totalSteps={ steps.length }
					/>
						<div className="mailchimp__setup-dialog-content">
							{ this.renderStep() }
						</div>
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
};

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
		submitMailChimpStoreInfo,
		submitMailChimpCampaignDefaults,
		submitMailChimpNewsletterSettings
	}
)( MailChimpSetup ) );
