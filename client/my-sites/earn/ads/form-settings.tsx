import { Button, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	BaseControl,
	Card,
	CardBody,
	CardHeader,
	CheckboxControl,
	RadioControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { isEqual } from 'lodash';
import { Fragment, useState, useEffect, ChangeEvent, FormEvent, ReactNode } from 'react';
import QueryWordadsSettings from 'calypso/components/data/query-wordads-settings';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
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
			<RadioControl
				label={ String( translate( 'Ads Visibility' ) ) }
				selected={ settings.show_to_logged_in }
				options={ [
					{ label: String( translate( 'Run ads for all users' ) ), value: 'yes' },
					{
						label: String( translate( 'Run ads only for logged-out users (less revenue)' ) ),
						value: 'no',
					},
					{ label: String( translate( 'Pause ads (no revenue)' ) ), value: 'pause' },
				] }
				onChange={ ( value ) =>
					setSettings( ( prevState ) => ( { ...prevState, show_to_logged_in: value } ) )
				}
				disabled={ isLoading }
			/>
		);
	}

	function displayOptions() {
		const isDisabled = isLoading || Boolean( siteIsJetpack && ! settings.jetpack_module_enabled );

		return (
			<>
				<div>
					<BaseControl.VisualLabel>
						{ translate( 'Display ads below posts on' ) }
					</BaseControl.VisualLabel>
					<VStack spacing={ 3 }>
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
					</VStack>
				</div>
				<div>
					<BaseControl.VisualLabel>
						{ translate( 'Additional ad placements' ) }
					</BaseControl.VisualLabel>
					<VStack spacing={ 3 }>
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
					</VStack>
				</div>
			</>
		);
	}

	function paymentOptions() {
		return (
			<TextControl
				type="email"
				label={ translate( 'PayPal email address' ) }
				value={ settings.paypal || '' }
				onChange={ ( value ) =>
					setSettings( ( prevState ) => ( { ...prevState, paypal: value } ) )
				}
				disabled={ isLoading }
				help={ translate(
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
			/>
		);
	}

	function acceptCheckbox() {
		return (
			<div>
				<FormSectionHeading>{ translate( 'Terms of Service' ) }</FormSectionHeading>
				<CheckboxControl
					checked={ !! settings.tos }
					onChange={ () => handleCompactToggle( 'tos' ) }
					disabled={ isLoading || 'signed' === settings.tos }
					// CheckboxControl types `label` as a string, but it renders any ReactNode
					// inside the <label>, so the cast lets us keep the linked agreement text.
					label={
						translate(
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
						) as string
					}
				/>
			</div>
		);
	}

	function privacy() {
		const isDisabled = isLoading || Boolean( siteIsJetpack && ! settings.jetpack_module_enabled );

		return (
			<VStack spacing={ 6 }>
				<div>
					<HStack justify="space-between" alignment="flex-start" spacing={ 4 }>
						<ToggleControl
							checked={ !! settings.ccpa_enabled }
							disabled={ isDisabled }
							onChange={ () => handleCompactToggle( 'ccpa_enabled' ) }
							label={ translate(
								'Enable targeted advertising to site visitors in all US states.'
							) }
							help={ translate(
								'Some US states have laws that require offering site visitors an opt-out from having their data used to personalize ads. Targeted advertising is off in certain states unless you enable it.'
							) }
						/>
						<SupportInfo
							text={ translate(
								'Enables a targeted advertising opt-out link in US states where this is legally required.'
							) }
							link={ localizeUrl(
								'https://wordpress.com/support/us-privacy-laws-and-your-wordpress-com-site/'
							) }
						/>
					</HStack>

					{ settings.ccpa_enabled && (
						<div className="ads__child-settings">
							<VStack spacing={ 6 }>
								<div>
									<FormLabel>{ translate( 'Do Not Sell link' ) }</FormLabel>
									<VStack spacing={ 2 }>
										<Text as="p">
											{ translate(
												'If you enable targeted advertising in all US states you are required to place a "Do Not Sell or Share My Personal Information" link on every page of your site where targeted advertising will appear. You can use the {{a}}Do Not Sell Link Widget{{/a}}, or the {{code}}[privacy-do-not-sell-link]{{/code}} shortcode to automatically place this link on your site. Note: the link will always display to logged in administrators regardless of geolocation.',
												{
													components: {
														a: (
															<a
																href={ widgetsUrl ?? '#' }
																target="_blank"
																rel="noopener noreferrer"
															/>
														),
														code: <code className="ads__inline-code" />,
													},
												}
											) }
										</Text>
										<Text variant="muted" as="p" size={ 12 }>
											{ translate(
												'Failure to add this link will result in non-compliance with privacy laws in some US states.'
											) }
										</Text>
									</VStack>
								</div>

								<TextControl
									type="url"
									label={ translate( 'Privacy policy URL' ) }
									value={ settings.ccpa_privacy_policy_url || '' }
									onChange={ ( value ) =>
										setSettings( ( prevState ) => ( {
											...prevState,
											ccpa_privacy_policy_url: value,
										} ) )
									}
									disabled={ isDisabled }
									placeholder="https://"
									help={ translate(
										'Adds a link to your privacy policy to the notice popup triggered by the do not sell link (optional).'
									) }
								/>
							</VStack>
						</div>
					) }
				</div>

				{ siteIsJetpack && (
					<div>
						<ToggleControl
							checked={ !! settings.cmp_enabled }
							disabled={ isDisabled }
							onChange={ () => handleCompactToggle( 'cmp_enabled' ) }
							label={ translate( 'Enable GDPR Consent Banner' ) }
							help={ translate(
								'Show a cookie banner to all EU and UK site visitors prompting them to consent to their personal data being used to personalize the ads they see. Without proper consents EU/UK visitors will only see lower paying non-personalized ads.'
							) }
						/>
					</div>
				) }
			</VStack>
		);
	}

	function adstxt() {
		const isDisabled = isLoading || Boolean( siteIsJetpack && ! settings.jetpack_module_enabled );

		return (
			<div>
				<HStack justify="space-between" alignment="center" spacing={ 1 }>
					<FormSectionHeading className="ads__adstxt-heading">
						{ translate( 'Ads.txt' ) }
					</FormSectionHeading>
					<SupportInfo
						text={ translate(
							'Ads.txt (Authorized Digital Sellers) is a mechanism that enables content owners to declare who is authorized to sell their ad inventory. It’s the formal list of advertising partners you support as a publisher.'
						) }
						link="https://jetpack.com/support/ads/"
					/>
				</HStack>
				<ToggleControl
					checked={ !! settings.custom_adstxt_enabled }
					disabled={ isDisabled }
					onChange={ () => handleCompactToggle( 'custom_adstxt_enabled' ) }
					label={ translate( 'Customize your ads.txt file' ) }
				/>
				{ settings.custom_adstxt_enabled && (
					<>
						<div className="ads__child-settings">
							<Text variant="muted" as="p" size={ 12 }>
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
							</Text>
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
			</div>
		);
	}

	function renderCardHeader( title: ReactNode ) {
		return (
			<CardHeader>
				<Text style={ { fontSize: '1.25rem', fontWeight: 500 } }>{ title }</Text>
				<Button compact primary onClick={ handleSubmit } disabled={ isLoading || ! isWordAds }>
					{ isLoading ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
				</Button>
			</CardHeader>
		);
	}

	if ( ! site ) {
		return <LoadingEllipsis />;
	}

	return (
		<Fragment>
			<QueryWordadsSettings siteId={ site.ID } />

			<form
				id="wordads-settings"
				className="wordads-settings"
				onSubmit={ handleSubmit }
				onChange={ () => setIsChanged( true ) }
			>
				<ProtectFormGuard isChanged={ isChanged } />

				<VStack spacing={ 6 }>
					<Card>
						{ renderCardHeader( translate( 'Ads Settings' ) ) }
						<CardBody>
							<VStack spacing={ 6 }>
								{ showAdsToOptions() }

								{ displayOptions() }
							</VStack>
						</CardBody>
					</Card>

					<Card>
						{ renderCardHeader( translate( 'Privacy and Consent' ) ) }
						<CardBody>{ privacy() }</CardBody>
					</Card>

					<Card>
						{ renderCardHeader( translate( 'Payments & Terms' ) ) }
						<CardBody>
							<VStack spacing={ 6 }>
								{ siteIsJetpack ? adstxt() : null }

								{ paymentOptions() }

								{ acceptCheckbox() }
							</VStack>
						</CardBody>
					</Card>
				</VStack>
			</form>
		</Fragment>
	);
};

export default AdsFormSettings;
