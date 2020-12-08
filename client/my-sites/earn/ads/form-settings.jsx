/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { flowRight as compose, isEmpty } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import StateSelector from 'calypso/components/forms/us-state-selector';
import FormToggle from 'calypso/components/forms/form-toggle';
import isSavingWordadsSettings from 'calypso/state/selectors/is-saving-wordads-settings';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormRadio from 'calypso/components/forms/form-radio';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import QueryWordadsSettings from 'calypso/components/data/query-wordads-settings';
import SectionHeader from 'calypso/components/section-header';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getWordadsSettings } from 'calypso/state/selectors/get-wordads-settings';
import { isJetpackSite, getCustomizerUrl } from 'calypso/state/sites/selectors';
import { dismissWordAdsSuccess } from 'calypso/state/wordads/approve/actions';
import { protectForm } from 'calypso/lib/protect-form';
import { saveWordadsSettings } from 'calypso/state/wordads/settings/actions';
import SupportInfo from 'calypso/components/support-info';

class AdsFormSettings extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
		markChanged: PropTypes.func.isRequired,
		markSaved: PropTypes.func.isRequired,
	};

	state = {};

	UNSAFE_componentWillReceiveProps( { wordadsSettings } ) {
		if ( isEmpty( this.state ) && wordadsSettings ) {
			this.setState( {
				...this.defaultSettings(),
				...wordadsSettings,
			} );
		}
	}

	handleChange = ( event ) => {
		const name = event.currentTarget.name;
		const value = event.currentTarget.value;

		this.setState( {
			[ name ]: value,
		} );
	};

	handleToggle = ( event ) => {
		const name = event.currentTarget.name;

		this.setState( {
			[ name ]: ! this.state[ name ],
		} );
	};

	handleDisplayToggle = ( name ) => () => {
		this.setState( ( prevState ) => ( {
			display_options: {
				...prevState.display_options,
				[ name ]: ! this.state.display_options[ name ],
			},
		} ) );
	};

	handleCompactToggle = ( name ) => () => {
		this.setState( {
			[ name ]: ! this.state[ name ],
		} );
	};

	handleResidentCheckbox = () => {
		const isResident = ! this.state.us_checked;

		this.setState( {
			us_checked: isResident,
			us_resident: isResident ? 'yes' : 'no',
		} );
	};

	handleSubmit = ( event ) => {
		const { site } = this.props;
		event.preventDefault();

		this.props.saveWordadsSettings( site.ID, this.packageState() );

		this.props.markSaved();
	};

	defaultSettings() {
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
			display_options: {},
			ccpa_enabled: false,
			ccpa_privacy_policy_url: '',
		};
	}

	packageState() {
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
			zip: this.state.zip,
			display_options: this.state.display_options,
			ccpa_enabled: this.state.ccpa_enabled,
			ccpa_privacy_policy_url: this.state.ccpa_privacy_policy_url,
		};
	}

	jetpackPlacementControls() {
		const { translate, site } = this.props;
		const linkHref = '/marketing/traffic/' + site?.slug;

		return <Card href={ linkHref }>{ translate( 'Manage ad placements' ) }</Card>;
	}

	showAdsToOptions() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Ads Visibility' ) }</FormLegend>
				<FormLabel>
					<FormRadio
						name="show_to_logged_in"
						value="yes"
						checked={ 'yes' === this.state.show_to_logged_in }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
						label={ translate( 'Run ads for all users' ) }
					/>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="show_to_logged_in"
						value="no"
						checked={ 'no' === this.state.show_to_logged_in }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
						label={ translate( 'Run ads only for logged-out users (less revenue)' ) }
					/>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="show_to_logged_in"
						value="pause"
						checked={ 'pause' === this.state.show_to_logged_in }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
						label={ translate( 'Pause ads (no revenue)' ) }
					/>
				</FormLabel>
			</FormFieldset>
		);
	}

	additionalAdsOption() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Additional Ads' ) }</FormLegend>
				<FormLabel>
					<FormCheckbox
						name="optimized_ads"
						checked={ !! this.state.optimized_ads }
						onChange={ this.handleToggle }
						disabled={ this.props.isLoading }
					/>
					<span>
						{ translate( 'Show optimized ads. ' ) }
						<a target="_blank" rel="noopener noreferrer" href="https://wordads.co/optimized-ads/">
							{ translate( 'Learn More' ) }
						</a>
					</span>
				</FormLabel>
			</FormFieldset>
		);
	}

	displayOptions() {
		const { translate } = this.props;

		return (
			<div>
				<FormFieldset className="ads__settings-display-toggles">
					<FormLegend>{ translate( 'Display ads below posts on' ) }</FormLegend>
					<FormToggle
						checked={ !! this.state.display_options?.display_front_page }
						disabled={ this.props.isLoading }
						onChange={ this.handleDisplayToggle( 'display_front_page' ) }
					>
						{ translate( 'Front page' ) }
					</FormToggle>
					<FormToggle
						checked={ !! this.state.display_options?.display_post }
						disabled={ this.props.isLoading }
						onChange={ this.handleDisplayToggle( 'display_post' ) }
					>
						{ translate( 'Posts' ) }
					</FormToggle>
					<FormToggle
						checked={ !! this.state.display_options?.display_page }
						disabled={ this.props.isLoading }
						onChange={ this.handleDisplayToggle( 'display_page' ) }
					>
						{ translate( 'Pages' ) }
					</FormToggle>
					<FormToggle
						checked={ !! this.state.display_options?.display_archive }
						disabled={ this.props.isLoading }
						onChange={ this.handleDisplayToggle( 'display_archive' ) }
					>
						{ translate( 'Archives' ) }
					</FormToggle>
				</FormFieldset>
				<FormFieldset className="ads__settings-display-toggles">
					<FormLegend>{ translate( 'Additional ad placements' ) }</FormLegend>
					<FormToggle
						checked={ !! this.state.display_options?.enable_header_ad }
						disabled={ this.props.isLoading }
						onChange={ this.handleDisplayToggle( 'enable_header_ad' ) }
					>
						{ translate( 'Top of each page' ) }
					</FormToggle>
					<FormToggle
						checked={ !! this.state.display_options?.second_belowpost }
						disabled={ this.props.isLoading }
						onChange={ this.handleDisplayToggle( 'second_belowpost' ) }
					>
						{ translate( 'Second ad below post' ) }
					</FormToggle>
					<FormToggle
						checked={ !! this.state.display_options?.sidebar }
						disabled={ this.props.isLoading }
						onChange={ this.handleDisplayToggle( 'sidebar' ) }
					>
						{ translate( 'Sidebar' ) }
					</FormToggle>
				</FormFieldset>
			</div>
		);
	}

	siteOwnerOptions() {
		const { translate } = this.props;

		return (
			<div>
				<FormFieldset>
					<FormLabel htmlFor="paypal">{ translate( 'PayPal E-mail Address' ) }</FormLabel>
					<FormTextInput
						name="paypal"
						id="paypal"
						value={ this.state.paypal || '' }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="who_owns">{ translate( 'Who owns this site?' ) }</FormLabel>
					<FormSelect
						name="who_owns"
						id="who_owns"
						value={ this.state.who_owns || '' }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
					>
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
							checked={ !! this.state.us_checked }
							disabled={ this.props.isLoading }
							onChange={ this.handleResidentCheckbox }
						/>
						<span>{ translate( 'US Resident or based in the US' ) }</span>
					</FormLabel>
				</FormFieldset>
			</div>
		);
	}

	taxOptions() {
		const { translate } = this.props;

		return (
			<div>
				<FormSectionHeading>{ translate( 'Tax Reporting Information' ) }</FormSectionHeading>
				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormLabel htmlFor="taxid">
						{ translate( 'Social Security Number or US Tax ID' ) }
					</FormLabel>
					<FormTextInput
						name="taxid"
						id="taxid"
						placeholder={
							this.state.taxid_last4
								? 'On file. Last Four Digits: '.concat( this.state.taxid_last4 )
								: ''
						}
						value={ this.state.taxid || '' }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
					/>
				</FormFieldset>

				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormLabel htmlFor="name">
						{ translate( 'Full Name or Business / Non-profit Name' ) }
					</FormLabel>
					<FormTextInput
						name="name"
						id="name"
						value={ this.state.name || '' }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
					/>
				</FormFieldset>

				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormLabel htmlFor="addr1">{ translate( 'Postal Address' ) }</FormLabel>
					<FormTextInput
						name="addr1"
						id="addr1"
						placeholder="Address Line 1"
						value={ this.state.addr1 || '' }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
					/>
				</FormFieldset>

				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormTextInput
						name="addr2"
						id="addr2"
						placeholder="Address Line 2"
						value={ this.state.addr2 || '' }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
					/>
				</FormFieldset>

				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormLabel htmlFor="city">{ translate( 'City' ) }</FormLabel>
					<FormTextInput
						name="city"
						id="city"
						value={ this.state.city || '' }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
					/>
				</FormFieldset>

				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormLabel htmlFor="state">{ translate( 'State / Territory' ) }</FormLabel>
					<StateSelector
						name="state"
						id="state"
						className="ads__settings-state"
						value={ this.state.state || '' }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
					/>
				</FormFieldset>

				<FormFieldset disabled={ 'yes' !== this.state.us_resident }>
					<FormLabel htmlFor="zip">{ translate( 'Zip Code' ) }</FormLabel>
					<FormTextInput
						name="zip"
						id="zip"
						value={ this.state.zip || '' }
						onChange={ this.handleChange }
						disabled={ this.props.isLoading }
					/>
				</FormFieldset>
			</div>
		);
	}

	acceptCheckbox() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel>
					<FormCheckbox
						name="tos"
						checked={ !! this.state.tos }
						onChange={ this.handleToggle }
						disabled={ this.props.isLoading || 'signed' === this.state.tos }
					/>
					<span>
						{ translate(
							'I have read and agree to the {{a}}Automattic Ads Terms of Service{{/a}}. {{br/}}I agree to post only {{b}}family-friendly content{{/b}} and will not purchase non-human traffic.',
							{
								components: {
									a: (
										<a
											href="https://wordpress.com/automattic-ads-tos/"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
									br: <br />,
									b: (
										<a
											href="https://wordads.co/2012/09/06/wordads-is-for-family-safe-sites/"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</span>
				</FormLabel>
			</FormFieldset>
		);
	}

	privacy() {
		const { translate } = this.props;

		return (
			<div>
				<FormSectionHeading>{ translate( 'Privacy and Consent' ) }</FormSectionHeading>
				<FormFieldset>
					<SupportInfo
						text={ translate(
							'Enables a targeted advertising opt-out link for California consumers, as required by the California Consumer Privacy Act (CCPA).'
						) }
						link="https://wordpress.com/support/your-wordpress-com-site-and-the-ccpa/"
					/>
					<FormToggle
						checked={ !! this.state.ccpa_enabled }
						disabled={ this.props.isLoading }
						onChange={ this.handleCompactToggle( 'ccpa_enabled' ) }
					>
						{ translate( 'Enable targeted advertising to California site visitors (CCPA)' ) }
					</FormToggle>

					<div className="ads__child-settings">
						<FormSettingExplanation>
							{ translate(
								'For more information about the California Consumer Privacy Act (CCPA) and how it pertains to your site, please consult our {{a}}CCPA guide for site owners{{/a}}.',
								{
									components: {
										a: (
											<a
												href="https://wordpress.com/support/your-wordpress-com-site-and-the-ccpa/"
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
									},
								}
							) }
						</FormSettingExplanation>
					</div>
				</FormFieldset>

				{ this.state.ccpa_enabled && (
					<div className="ads__child-settings">
						<FormFieldset>
							<FormLabel>{ translate( 'Do Not Sell Link' ) }</FormLabel>
							<span>
								{ translate(
									'CCPA requires that you place a "Do Not Sell My Personal Information" link on every page of your site where targeted advertising will appear. You can use the {{a}}Do Not Sell Link (CCPA) Widget{{/a}}, or the {{code}}[ccpa-do-not-sell-link]{{/code}} shortcode to automatically place this link on your site. Note: the link will always display to logged in administrators regardless of geolocation.',
									{
										components: {
											a: (
												<a
													href={ this.props.widgetsUrl }
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
											code: <code />,
										},
									}
								) }
							</span>
							<FormSettingExplanation>
								{ translate( 'Failure to add this link will result in non-compliance with CCPA.' ) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="ccpa-privacy-policy-url">
								{ translate( 'Privacy Policy URL' ) }
							</FormLabel>
							<FormTextInput
								name="ccpa_privacy_policy_url"
								id="ccpa-privacy-policy-url"
								value={ this.state.ccpa_privacy_policy_url || '' }
								onChange={ this.handleChange }
								disabled={ this.props.isLoading }
								placeholder="https://"
							/>
							<FormSettingExplanation>
								{ translate(
									'Adds a link to your privacy policy to the bottom of the CCPA notice popup (optional).'
								) }
							</FormSettingExplanation>
						</FormFieldset>
					</div>
				) }
			</div>
		);
	}

	render() {
		const { isLoading, site, translate } = this.props;

		const isWordAds = this.props.site.options.wordads;

		return (
			<Fragment>
				<QueryWordadsSettings siteId={ site.ID } />

				{ this.props.siteIsJetpack && isWordAds ? this.jetpackPlacementControls() : null }

				<SectionHeader label={ translate( 'Ads Settings' ) }>
					<Button
						compact
						primary
						onClick={ this.handleSubmit }
						disabled={ isLoading || ! isWordAds }
					>
						{ isLoading ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>

				<Card>
					<form
						id="wordads-settings"
						onSubmit={ this.handleSubmit }
						onChange={ this.props.markChanged }
					>
						{ ! this.props.siteIsJetpack ? this.showAdsToOptions() : null }

						{ ! this.props.siteIsJetpack ? this.displayOptions() : null }

						{ ! this.props.siteIsJetpack ? this.privacy() : null }

						<FormSectionHeading>{ translate( 'Site Owner Information' ) }</FormSectionHeading>
						{ this.siteOwnerOptions() }
						{ this.state.us_checked ? this.taxOptions() : null }

						<FormSectionHeading>{ translate( 'Terms of Service' ) }</FormSectionHeading>
						{ this.acceptCheckbox() }
					</form>
				</Card>
			</Fragment>
		);
	}
}

export default compose(
	connect(
		( state ) => {
			const siteId = getSelectedSiteId( state );
			const isSavingSettings = isSavingWordadsSettings( state, siteId );
			const wordadsSettings = getWordadsSettings( state, siteId );

			return {
				isLoading: isSavingSettings || ! wordadsSettings,
				site: getSelectedSite( state ),
				siteIsJetpack: isJetpackSite( state, siteId ),
				wordadsSettings,
				widgetsUrl: getCustomizerUrl( state, siteId, 'widgets' ),
			};
		},
		{ dismissWordAdsSuccess, saveWordadsSettings }
	),
	localize,
	protectForm
)( AdsFormSettings );
