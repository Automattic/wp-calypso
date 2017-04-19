/**
 * External dependencies
 */
var React = require( 'react' ),
	LinkedStateMixin = require( 'react-addons-linked-state-mixin' ),
	notices = require( 'notices' ),
	debug = require( 'debug' )( 'calypso:my-sites:ads-settings' );
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import StateSelector from 'components/forms/us-state-selector';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormCheckbox from 'components/forms/form-checkbox';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import WordadsActions from 'lib/ads/actions';
import SettingsStore from 'lib/ads/settings-store';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { dismissWordAdsSuccess } from 'state/wordads/approve/actions';
import { protectForm } from 'lib/protect-form';

const AdsFormSettings = React.createClass( {

	displayName: 'AdsFormSettings',

	mixins: [ LinkedStateMixin ],

	propTypes: {
		site: React.PropTypes.object.isRequired,
		markChanged: React.PropTypes.func.isRequired,
		markSaved: React.PropTypes.func.isRequired
	},

	componentWillMount: function() {
		debug( 'Mounting ' + this.constructor.displayName + ' React component.' );
		SettingsStore.on( 'change', this.updateSettings );
		this._fetchIfEmpty();
	},

	componentWillUnmount: function() {
		SettingsStore.removeListener( 'change', this.updateSettings );
		SettingsStore.clearNotices();
	},

	updateSettings: function() {
		var settings = this.getSettingsFromStore();
		const { site } = this.props;
		this.setState( settings );

		// set/clear any notices on update
		site && this.props.dismissWordAdsSuccess( site.ID );
		if ( settings.error && settings.error.message ) {
			notices.error( settings.error.message );
		} else if ( settings.notice ) {
			notices.success( settings.notice );
		} else {
			notices.clearNotices( 'notices' );
		}
	},

	componentWillReceiveProps: function( nextProps ) {
		const { site } = this.props;
		if ( ! nextProps || ! nextProps.site || ! nextProps.site.ID ) {
			return;
		}

		if ( ! SettingsStore.settingsLoaded( nextProps.site.ID ) ) {
			this.resetState();
		}

		if ( site.ID !== nextProps.site.ID ) {
			this._fetchIfEmpty( nextProps.site );
			this.setState( this.getSettingsFromStore( nextProps.site ) );
		}
	},

	getInitialState: function() {
		var store = this.getSettingsFromStore();
		if ( ! store.tos ) {
			store = this.defaultSettings();
		}

		return store;
	},

	handleRadio: function( event ) {
		var name = event.currentTarget.name,
			value = event.currentTarget.value,
			updateObj = {};

		updateObj[ name ] = value;
		this.setState( updateObj );
	},

	handleResidentCheckbox: function() {
		var isResident = ! this.state.us_checked;
		this.setState( {
			us_checked: isResident,
			us_resident: isResident ? 'yes' : 'no'
		} );
	},

	submitForm: function( event ) {
		event.preventDefault();
		const { site } = this.props;
		WordadsActions.updateSettings( site, this.packageState() );
		this.setState( { notice: null, error: null } );
		this.props.markSaved();
	},

	getSettingsFromStore: function( siteInstance ) {
		const site = siteInstance || this.props.site,
			store = SettingsStore.getById( site.ID );

		store.us_checked = 'yes' === store.us_resident;
		if ( this.props.siteIsJetpack ) {
			// JP doesn't matter, force yes to make things easier
			store.show_to_logged_in = 'yes';
		}

		return store;
	},

	resetState: function() {
		debug( 'wordads state reset' );
		this.replaceState( this.defaultSettings() );
	},

	defaultSettings: function() {
		return {
			addr1: '',
			addr2: '',
			city: '',
			name: '',
			optimized_ads: false,
			paypal: '',
			show_to_logged_in: 'yes',
			state: 'AL',
			taxid_last4: '',
			tos: 'signed',
			us_resident: 'no',
			us_checked: false,
			who_owns: 'person',
			zip: '',
			isLoading: false,
			isSubmitting: false,
			error: {},
			notice: null
		};
	},

	packageState: function() {
		return {
			addr1: this.state.addr1,
			addr2: this.state.addr2,
			city: this.state.city,
			name: this.state.name,
			optimized_ads: this.state.optimized_ads,
			paypal: this.state.paypal,
			show_to_logged_in: this.state.show_to_logged_in,
			state: this.state.state,
			taxid: this.state.taxid || '',
			tos: this.state.tos ? 'signed' : '',
			us_resident: this.state.us_resident,
			who_owns: this.state.who_owns,
			zip: this.state.zip
		};
	},

	_fetchIfEmpty: function( site ) {
		site = site || this.props.site;
		if ( ! site || ! site.ID ) {
			return;
		}

		if ( SettingsStore.settingsLoaded( site.ID ) ) {
			debug( 'initial fetch not necessary' );
			return;
		}

		// defer fetch requests to avoid dispatcher conflicts
		setTimeout( function() {
			WordadsActions.fetchSettings( site )
		}, 0 );
	},

	showAdsToOptions: function() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Ads Visibility' ) }</FormLegend>
				<FormLabel>
					<FormRadio
						name="show_to_logged_in"
						value="yes"
						checked={ 'yes' === this.state.show_to_logged_in }
						onChange={ this.handleRadio }
						disabled={ this.state.isLoading } />
					<span>{ translate( 'Run ads for all users' ) }</span>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="show_to_logged_in"
						value="no"
						checked={ 'no' === this.state.show_to_logged_in }
						onChange={ this.handleRadio }
						disabled={ this.state.isLoading } />
					<span>{ translate( 'Run ads only for logged-out users (less revenue)' ) }</span>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="show_to_logged_in"
						value="pause"
						checked={ 'pause' === this.state.show_to_logged_in }
						onChange={ this.handleRadio }
						disabled={ this.state.isLoading } />
					<span>{ translate( 'Pause ads (no revenue)' ) }</span>
				</FormLabel>
			</FormFieldset>
		);
	},

	additionalAdsOption: function() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Additional Ads' ) }</FormLegend>
				<FormLabel>
					<FormCheckbox
						name="optimized_ads"
						checkedLink={ this.linkState( 'optimized_ads' ) }
						disabled={ this.state.isLoading } />
					<span>
						{ translate( 'Show optimized ads. ' ) }
						<a target="_blank" rel="noopener noreferrer" href="https://wordads.co/optimized-ads/">
							{ translate( 'Learn More' ) }
						</a>
					</span>
				</FormLabel>
			</FormFieldset>
		);
	},

	siteOwnerOptions: function() {
		const { translate } = this.props;

		return (
			<div>
				<FormFieldset>
					<FormLabel htmlFor="paypal">{ translate( 'PayPal E-mail Address' ) }</FormLabel>
					<FormTextInput
						name="paypal"
						id="paypal"
						valueLink={ this.linkState( 'paypal' ) }
						disabled={ this.state.isLoading } />
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="who_owns">{ translate( 'Who owns this site?' ) }</FormLabel>
					<FormSelect
						name="who_owns"
						id="who_owns"
						valueLink={ this.linkState( 'who_owns' ) }
						disabled={ this.state.isLoading }>
							<option value="">{ translate( 'Select who owns this site' ) }</option>
							<option value="person">{ translate( 'An Individual/Sole Proprietor' ) }</option>
							<option value="corp">{ translate( 'A Corporation' ) }</option>
							<option value="partnership">{ translate( 'A Partnership' ) }</option>
							<option value="llc">{ translate( 'An LLC' ) }</option>
							<option value="tax_exempt">{ translate( 'A Tax-Exempt Entity' ) }</option>
					</FormSelect>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						<FormCheckbox
							name="us_resident"
							checked={ this.state.us_checked }
							disabled={ this.state.isLoading }
							onChange={ this.handleResidentCheckbox } />
						<span>{ translate( 'US Resident or based in the US' ) }</span>
					</FormLabel>
				</FormFieldset>
			</div>
		);
	},

	taxOptions: function() {
		const { translate } = this.props;

		return (
			<div>
				<FormSectionHeading>{ translate( 'Tax Reporting Information' ) }</FormSectionHeading>
				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormLabel htmlFor="taxid">{ translate( 'Social Security Number or US Tax ID' ) }</FormLabel>
					<FormTextInput
						name="taxid"
						id="taxid"
						placeholder={ this.state.taxid_last4 ? 'On file. Last Four Digits: '.concat( this.state.taxid_last4 ) : '' }
						valueLink={ this.linkState( 'taxid' ) }
						disabled={ this.state.isLoading } />
				</FormFieldset>

				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormLabel htmlFor="name">{ translate( 'Full Name or Business / Non-profit Name' ) }</FormLabel>
					<FormTextInput
						name="name"
						id="name"
						valueLink={ this.linkState( 'name' ) }
						disabled={ this.state.isLoading } />
				</FormFieldset>

				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormLabel htmlFor="addr1">{ translate( 'Postal Address' ) }</FormLabel>
					<FormTextInput
						name="addr1"
						id="addr1"
						placeholder="Address Line 1"
						valueLink={ this.linkState( 'addr1' ) }
						disabled={ this.state.isLoading } />
				</FormFieldset>

				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormTextInput
						name="addr2"
						id="addr2"
						placeholder="Address Line 2"
						valueLink={ this.linkState( 'addr2' ) }
						disabled={ this.state.isLoading } />
				</FormFieldset>

				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormLabel htmlFor="city">{ translate( 'City' ) }</FormLabel>
					<FormTextInput
						name="city"
						id="city"
						valueLink={ this.linkState( 'city' ) }
						disabled={ this.state.isLoading } />
				</FormFieldset>

				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormLabel htmlFor="state">{ translate( 'State / Territory' ) }</FormLabel>
					<StateSelector
						name="state"
						id="state"
						className="settings__state"
						valueLink={ this.linkState( 'state' ) }
						disabled={ this.state.isLoading } />
				</FormFieldset>

				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormLabel htmlFor="zip">{ translate( 'Zip Code' ) }</FormLabel>
					<FormTextInput
						name="zip"
						id="zip"
						valueLink={ this.linkState( 'zip' ) }
						disabled={ this.state.isLoading } />
				</FormFieldset>
			</div>
		);
	},

	acceptCheckbox: function() {
		return (
			<FormFieldset className="wordads-tos__fieldset">
				<FormLabel>
					<FormCheckbox
						name="tos"
						checkedLink={ this.linkState( 'tos' ) }
						disabled={ this.state.isLoading || 'signed' === this.state.tos } />
					<span>{ this.props.translate( 'I have read and agree to the {{a}}Automattic Ads Terms of Service{{/a}}.', {
						components: { a: <a href="https://wordpress.com/automattic-ads-tos/" target="_blank" rel="noopener noreferrer" /> }
					} ) }</span>
				</FormLabel>
			</FormFieldset>
		);
	},

	render: function() {
		const { translate } = this.props;

		return (
			<Card className="settings">
				<form id="wordads-settings" onSubmit={ this.submitForm } onChange={ this.props.markChanged }>
					<FormButtonsBar>
						<FormButton
							disabled={ this.state.isLoading || this.state.isSubmitting }>
								{ this.state.isSubmitting ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
						</FormButton>
					</FormButtonsBar>
					{ ! this.props.siteIsJetpack ? this.showAdsToOptions() : null }
					{ ! this.props.siteIsJetpack ? this.additionalAdsOption() : null }
					<FormSectionHeading>{ translate( 'Site Owner Information' ) }</FormSectionHeading>
					{ this.siteOwnerOptions() }
					{ this.state.us_checked ? this.taxOptions() : null }
					<FormSectionHeading>{ translate( 'Terms of Service' ) }</FormSectionHeading>
					{ this.acceptCheckbox() }
					<FormButtonsBar>
						<FormButton
							disabled={ this.state.isLoading || this.state.isSubmitting }>
								{ this.state.isSubmitting ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
						</FormButton>
					</FormButtonsBar>
				</form>
			</Card>
		);
	}
} );

export default compose(
	connect(
		( state ) => ( {
			site: getSelectedSite( state ),
			siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
		} ),
		{ dismissWordAdsSuccess },
	),
	localize,
	protectForm,
)( AdsFormSettings );
