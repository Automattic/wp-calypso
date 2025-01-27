import { Button, Card, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { isEqual } from 'lodash';
import { Fragment, useState, useEffect, ChangeEvent, FormEvent } from 'react';
import QueryWordadsSettings from 'calypso/components/data/query-wordads-settings';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import SectionHeader from 'calypso/components/section-header';
import SupportInfo from 'calypso/components/support-info';
import { ProtectFormGuard } from 'calypso/lib/protect-form';
import { useDispatch, useSelector } from 'calypso/state';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import { getWordadsSettings } from 'calypso/state/selectors/get-wordads-settings';
import isSavingWordadsSettings from 'calypso/state/selectors/is-saving-wordads-settings';
import {
	isJetpackSite,
	isJetpackMinimumVersion,
	getCustomizerUrl,
} from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { saveWordadsSettings } from 'calypso/state/wordads/settings/actions';

type DisplayOptions = {
	display_front_page?: boolean;
	display_post?: boolean;
	display_page?: boolean;
	display_archive?: boolean;
	enable_header_ad?: boolean;
	second_belowpost?: boolean;
	inline_enabled?: boolean;
	sidebar?: boolean;
};

type Settings = {
	optimized_ads?: boolean;
	paypal?: string;
	show_to_logged_in?: string;
	tos?: string;
	display_options?: DisplayOptions;
	ccpa_enabled?: boolean;
	ccpa_privacy_policy_url?: string;
	custom_adstxt_enabled?: boolean;
	custom_adstxt?: string;
	jetpack_module_enabled?: boolean;
	cmp_enabled?: boolean;
};

const AdsFormSettings = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ settings, setSettings ] = useState< Settings >( {} );
	const [ isChanged, setIsChanged ] = useState( false );

	const site = useSelector( getSelectedSite );
	const siteId = useSelector( getSelectedSiteId );
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ?? 0 ) );
	const siteIsJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ?? 0 ) );
	const isSavingSettings = useSelector( ( state ) =>
		isSavingWordadsSettings( state, siteId ?? 0 )
	);
	const wordadsSettings = useSelector( ( state ) => getWordadsSettings( state, siteId ) );
	const widgetsUrl = useSelector( ( state ) => getCustomizerUrl( state, siteId, 'widgets' ) );
	const isMinVersionForInlineAds = useSelector(
		( state ) => siteId && isJetpackMinimumVersion( state, siteId, '13.5-a.1' )
	);
	const supportsInlineAds = ! siteIsJetpack || isMinVersionForInlineAds;

	const isLoading = ! wordadsSettings || isSavingSettings;
	const isWordAds = site?.options?.wordads;

	useEffect( () => {
		const newSettings = {
			...defaultSettings(),
			...wordadsSettings,
		};
		const isUpdatedSettings = ! isEqual( newSettings, settings );
		if ( isUpdatedSettings ) {
			setSettings( newSettings );
		}
	}, [ wordadsSettings ] );

	function handleChange( event: ChangeEvent< HTMLInputElement > ) {
		const name = event.currentTarget.name;
		const value = event.currentTarget.value;

		setSettings( ( prevState ) => ( {
			...prevState,
			[ name ]: value,
		} ) );
	}

	function handleToggle( event: ChangeEvent< HTMLInputElement > ) {
		const name = event.currentTarget.name;

		setSettings( ( prevState ) => ( {
			...prevState,
			[ name ]: ! settings[ name as keyof Settings ],
		} ) );
	}

	function handleDisplayToggle( name: string ) {
		setSettings( ( prevState ) => ( {
			...prevState,
			display_options: {
				...prevState.display_options,
				[ name ]: ! settings?.display_options?.[ name as keyof DisplayOptions ],
			},
		} ) );
	}

	function handleCompactToggle( name: string ) {
		setSettings( ( prevState ) => ( {
			...prevState,
			[ name ]: ! settings[ name as keyof Settings ],
		} ) );
	}

	function handleSubmit( event: FormEvent< EventTarget > ) {
		event.preventDefault();

		if ( site ) {
			dispatch( saveWordadsSettings( site?.ID, packageState() ) );
			setIsChanged( false );
		}
	}

	function defaultSettings() {
		return {
			optimized_ads: false,
			paypal: '',
			show_to_logged_in: 'yes',
			tos: 'signed',
			display_options: {},
			ccpa_enabled: false,
			ccpa_privacy_policy_url: '',
			custom_adstxt_enabled: false,
			custom_adstxt: '',
			jetpack_module_enabled: false,
			cmp_enabled: false,
		};
	}

	function packageState() {
		return {
			optimized_ads: settings.optimized_ads,
			paypal: settings.paypal,
			show_to_logged_in: settings.show_to_logged_in,
			tos: settings.tos ? 'signed' : '',
			display_options: settings.display_options,
			ccpa_enabled: settings.ccpa_enabled,
			ccpa_privacy_policy_url: settings.ccpa_privacy_policy_url,
			custom_adstxt_enabled: settings.custom_adstxt_enabled,
			custom_adstxt: settings.custom_adstxt,
			jetpack_module_enabled: settings.jetpack_module_enabled,
			cmp_enabled: settings.cmp_enabled,
		};
	}

	function showAdsToOptions() {
		if ( siteIsJetpack ) {
			return (
				<ToggleControl
					checked={ !! settings.jetpack_module_enabled }
					disabled={ isLoading }
					onChange={ () => handleCompactToggle( 'jetpack_module_enabled' ) }
					label={ translate( 'Enable ads and display an ad below each post' ) }
				/>
			);
		}

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Ads Visibility' ) }</FormLegend>
				<FormLabel>
					<FormRadio
						name="show_to_logged_in"
						value="yes"
						checked={ 'yes' === settings.show_to_logged_in }
						onChange={ handleChange }
						disabled={ isLoading }
						label={ translate( 'Run ads for all users' ) }
					/>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="show_to_logged_in"
						value="no"
						checked={ 'no' === settings.show_to_logged_in }
						onChange={ handleChange }
						disabled={ isLoading }
						label={ translate( 'Run ads only for logged-out users (less revenue)' ) }
					/>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="show_to_logged_in"
						value="pause"
						checked={ 'pause' === settings.show_to_logged_in }
						onChange={ handleChange }
						disabled={ isLoading }
						label={ translate( 'Pause ads (no revenue)' ) }
					/>
				</FormLabel>
			</FormFieldset>
		);
	}

	function displayOptions() {
		const isDisabled = isLoading || Boolean( siteIsJetpack && ! settings.jetpack_module_enabled );

		return (
			<div>
				<FormFieldset className="ads__settings-display-toggles">
					<FormLegend>{ translate( 'Display ads below posts on' ) }</FormLegend>
					<ToggleControl
						checked={ !! settings.display_options?.display_front_page }
						disabled={ isDisabled }
						onChange={ () => handleDisplayToggle( 'display_front_page' ) }
						label={ translate( 'Front page' ) }
					/>
					<ToggleControl
						checked={ !! settings.display_options?.display_post }
						disabled={ isDisabled }
						onChange={ () => handleDisplayToggle( 'display_post' ) }
						label={ translate( 'Posts' ) }
					/>
					<ToggleControl
						checked={ !! settings.display_options?.display_page }
						disabled={ isDisabled }
						onChange={ () => handleDisplayToggle( 'display_page' ) }
						label={ translate( 'Pages' ) }
					/>
					<ToggleControl
						checked={ !! settings.display_options?.display_archive }
						disabled={ isDisabled }
						onChange={ () => handleDisplayToggle( 'display_archive' ) }
						label={ translate( 'Archives' ) }
					/>
				</FormFieldset>
				<FormFieldset className="ads__settings-display-toggles">
					<FormLegend>{ translate( 'Additional ad placements' ) }</FormLegend>
					<ToggleControl
						checked={ !! settings.display_options?.enable_header_ad }
						disabled={ isDisabled }
						onChange={ () => handleDisplayToggle( 'enable_header_ad' ) }
						label={ translate( 'Top of each page' ) }
					/>
					<ToggleControl
						checked={ !! settings.display_options?.second_belowpost }
						disabled={ isDisabled }
						onChange={ () => handleDisplayToggle( 'second_belowpost' ) }
						label={ translate( 'Second ad below post' ) }
					/>
					{ supportsInlineAds && (
						<ToggleControl
							checked={ !! settings.display_options?.inline_enabled }
							disabled={ isDisabled }
							onChange={ () => handleDisplayToggle( 'inline_enabled' ) }
							label={ translate( 'Inline within post content' ) }
						/>
					) }
					{ ! siteIsJetpack && (
						<ToggleControl
							checked={ !! settings.display_options?.sidebar }
							disabled={ isDisabled }
							onChange={ () => handleDisplayToggle( 'sidebar' ) }
							label={ translate( 'Sidebar' ) }
						/>
					) }
				</FormFieldset>
			</div>
		);
	}

	function paymentOptions() {
		return (
			<FormFieldset>
				<FormLabel htmlFor="paypal">{ translate( 'PayPal E-mail Address' ) }</FormLabel>
				<FormTextInput
					name="paypal"
					id="paypal-earn-input"
					value={ settings.paypal || '' }
					onChange={ handleChange }
					disabled={ isLoading }
				/>
				<FormSettingExplanation>
					{ translate(
						'Earnings will be paid to the PayPal account on file. A PayPal account in good standing with the ability to accept funds must be maintained in order to receive earnings.' +
							' You can verify which PayPal features are available to you by looking up your country on the {{a}}PayPal website{{/a}}.',
						{
							components: {
								a: (
									<a
										href="https://www.paypal.com/us/webapps/mpp/country-worldwide"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	function acceptCheckbox() {
		return (
			<FormFieldset>
				<FormLabel>
					<FormCheckbox
						name="tos"
						checked={ !! settings.tos }
						onChange={ handleToggle }
						disabled={ isLoading || 'signed' === settings.tos }
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

	function privacy() {
		const isDisabled = isLoading || Boolean( siteIsJetpack && ! settings.jetpack_module_enabled );

		return (
			<div>
				<FormSectionHeading>{ translate( 'Privacy and Consent' ) }</FormSectionHeading>
				<FormFieldset>
					<SupportInfo
						text={ translate(
							'Enables a targeted advertising opt-out link in US states where this is legally required.'
						) }
						link={ localizeUrl(
							'https://wordpress.com/support/us-privacy-laws-and-your-wordpress-com-site/'
						) }
					/>
					<ToggleControl
						checked={ !! settings.ccpa_enabled }
						disabled={ isDisabled }
						onChange={ () => handleCompactToggle( 'ccpa_enabled' ) }
						label={ translate( 'Enable targeted advertising to site visitors in all US states.' ) }
					/>

					<div className="ads__child-settings">
						<FormSettingExplanation>
							{ translate(
								'Some US states have laws that require offering site visitors an opt-out from having their data used to personalize ads. Targeted advertising is off in certain states unless you enable it.'
							) }
						</FormSettingExplanation>
					</div>
				</FormFieldset>

				{ settings.ccpa_enabled && (
					<div className="ads__child-settings">
						<FormFieldset>
							<FormLabel>{ translate( 'Do Not Sell Link' ) }</FormLabel>
							<span>
								{ translate(
									'If you enable targeted advertising in all US states you are required to place a "Do Not Sell or Share My Personal Information" link on every page of your site where targeted advertising will appear. You can use the {{a}}Do Not Sell Link Widget{{/a}}, or the {{code}}[privacy-do-not-sell-link]{{/code}} shortcode to automatically place this link on your site. Note: the link will always display to logged in administrators regardless of geolocation.',
									{
										components: {
											a: <a href={ widgetsUrl ?? '#' } target="_blank" rel="noopener noreferrer" />,
											code: <code />,
										},
									}
								) }
							</span>
							<FormSettingExplanation>
								{ translate(
									'Failure to add this link will result in non-compliance with privacy laws in some US states.'
								) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="ccpa-privacy-policy-url">
								{ translate( 'Privacy Policy URL' ) }
							</FormLabel>
							<FormTextInput
								name="ccpa_privacy_policy_url"
								id="ccpa-privacy-policy-url"
								value={ settings.ccpa_privacy_policy_url || '' }
								onChange={ handleChange }
								disabled={ isDisabled }
								placeholder="https://"
							/>
							<FormSettingExplanation>
								{ translate(
									'Adds a link to your privacy policy to the notice popup triggered by the do not sell link (optional).'
								) }
							</FormSettingExplanation>
						</FormFieldset>
					</div>
				) }

				{ siteIsJetpack && (
					<FormFieldset>
						<ToggleControl
							checked={ !! settings.cmp_enabled }
							disabled={ isDisabled }
							onChange={ () => handleCompactToggle( 'cmp_enabled' ) }
							label={ translate( 'Enable GDPR Consent Banner' ) }
						/>

						<div className="ads__child-settings">
							<FormSettingExplanation>
								{ translate(
									'Show a cookie banner to all EU and UK site visitors prompting them to consent to their personal data being used to personalize the ads they see. Without proper consents EU/UK visitors will only see lower paying non-personalized ads.'
								) }
							</FormSettingExplanation>
						</div>
					</FormFieldset>
				) }
			</div>
		);
	}

	function adstxt() {
		const isDisabled = isLoading || Boolean( siteIsJetpack && ! settings.jetpack_module_enabled );

		return (
			<div>
				<FormSectionHeading>{ translate( 'Ads.txt' ) }</FormSectionHeading>
				<FormFieldset>
					<SupportInfo
						text={ translate(
							'Ads.txt (Authorized Digital Sellers) is a mechanism that enables content owners to declare who is authorized to sell their ad inventory. It’s the formal list of advertising partners you support as a publisher.'
						) }
						link="https://jetpack.com/support/ads/"
					/>
					<ToggleControl
						checked={ !! settings.custom_adstxt_enabled }
						disabled={ isDisabled }
						onChange={ () => handleCompactToggle( 'custom_adstxt_enabled' ) }
						label={ translate( 'Customize your ads.txt file' ) }
					/>
					{ settings.custom_adstxt_enabled && (
						<>
							<div className="ads__child-settings">
								<FormSettingExplanation>
									{ translate(
										'Ads automatically generates a custom {{link1}}ads.txt{{/link1}} tailored for your site. If you need to add additional entries for other networks please add them in the space below, one per line. {{link2}}Check here for more details{{/link2}}.',
										{
											components: {
												link1: (
													<a
														href={ siteUrl + '/ads.txt' }
														target="_blank"
														rel="noopener noreferrer"
													/>
												),
												link2: (
													<a
														href="https://jetpack.com/2018/11/09/how-jetpack-ads-members-can-increase-their-earnings-with-ads-txt"
														target="_blank"
														rel="noopener noreferrer"
													/>
												),
											},
										}
									) }
								</FormSettingExplanation>
							</div>
							<div className="ads__child-settings">
								<FormTextarea
									name="custom_adstxt"
									value={ settings.custom_adstxt }
									onChange={ handleChange }
									disabled={ isDisabled }
								/>
							</div>
						</>
					) }
				</FormFieldset>
			</div>
		);
	}

	if ( ! site ) {
		return <LoadingEllipsis />;
	}

	return (
		<Fragment>
			<QueryWordadsSettings siteId={ site.ID } />

			<SectionHeader label={ translate( 'Ads Settings' ) }>
				<Button compact primary onClick={ handleSubmit } disabled={ isLoading || ! isWordAds }>
					{ isLoading ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>

			<Card>
				<form
					id="wordads-settings"
					onSubmit={ handleSubmit }
					onChange={ () => setIsChanged( true ) }
				>
					<ProtectFormGuard isChanged={ isChanged } />

					{ showAdsToOptions() }

					{ displayOptions() }

					{ privacy() }

					{ siteIsJetpack ? adstxt() : null }

					<FormSectionHeading>{ translate( 'Payment Information' ) }</FormSectionHeading>
					{ paymentOptions() }

					<FormSectionHeading>{ translate( 'Terms of Service' ) }</FormSectionHeading>
					{ acceptCheckbox() }
				</form>
			</Card>
		</Fragment>
	);
};

export default AdsFormSettings;
