import { isEnabled } from '@automattic/calypso-config';
import {
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	WPCOM_FEATURES_NO_WPCOM_BRANDING,
	WPCOM_FEATURES_SITE_PREVIEW_LINKS,
	FEATURE_STYLE_CUSTOMIZATION,
} from '@automattic/calypso-products';
import {
	WPCOM_FEATURES_SUBSCRIPTION_GIFTING,
	WPCOM_FEATURES_LOCKED_MODE,
	WPCOM_FEATURES_LEGACY_CONTACT,
} from '@automattic/calypso-products/src';
import { Card, CompactCard, Button, Gridicon } from '@automattic/components';
import { guessTimezone, localizeUrl } from '@automattic/i18n-utils';
import languages from '@automattic/languages';
import { ToggleControl } from '@wordpress/components';
import classNames from 'classnames';
import { flowRight, get } from 'lodash';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import fiverrLogo from 'calypso/assets/images/customer-home/fiverr-logo.svg';
import builtByLogo from 'calypso/assets/images/illustrations/built-by-wp-vert-blue.png';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import Banner from 'calypso/components/banner';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SiteLanguagePicker from 'calypso/components/language-picker/site-language-picker';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import SitePreviewLink from 'calypso/components/site-preview-link';
import Timezone from 'calypso/components/timezone';
import { preventWidows } from 'calypso/lib/formatting';
import scrollToAnchor from 'calypso/lib/scroll-to-anchor';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { launchSite } from 'calypso/state/sites/launch/actions';
import {
	isSiteOnECommerceTrial as getIsSiteOnECommerceTrial,
	isSiteOnMigrationTrial as getIsSiteOnMigrationTrial,
} from 'calypso/state/sites/plans/selectors';
import {
	getSiteOption,
	isJetpackSite,
	isCurrentPlanPaid,
	getCustomizerUrl,
} from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import Masterbar from './masterbar';
import SiteIconSetting from './site-icon-setting';
import TrialUpsellNotice from './trial-upsell-notice';
import wrapSettingsForm from './wrap-settings-form';

export class SiteSettingsFormGeneral extends Component {
	componentDidMount() {
		setTimeout( () => scrollToAnchor( { offset: 15 } ) );
	}

	getIncompleteLocaleNoticeMessage = ( language ) => {
		const { translate } = this.props;

		return translate(
			'Your site language is now %(language)s. Once you choose your theme, make sure it’s translated so the theme strings on your site show up in your language!',
			{
				args: {
					language: language.name,
				},
			}
		);
	};

	onTimezoneSelect = ( timezone ) => {
		this.props.updateFields( {
			timezone_string: timezone,
		} );
	};

	siteOptions() {
		const {
			translate,
			isRequestingSettings,
			fields,
			eventTracker,
			onChangeField,
			uniqueEventTracker,
			isWPForTeamsSite,
		} = this.props;

		return (
			<>
				<div className="site-settings__site-options">
					<div className="site-settings__site-title-tagline">
						<FormFieldset>
							<FormLabel htmlFor="blogname">{ translate( 'Site title' ) }</FormLabel>
							<FormInput
								name="blogname"
								id="blogname"
								data-tip-target="site-title-input"
								value={ fields.blogname || '' }
								onChange={ onChangeField( 'blogname' ) }
								disabled={ isRequestingSettings }
								onClick={ eventTracker( 'Clicked Site Title Field' ) }
								onKeyPress={ uniqueEventTracker( 'Typed in Site Title Field' ) }
							/>
						</FormFieldset>
						<FormFieldset>
							<FormLabel htmlFor="blogdescription">{ translate( 'Site tagline' ) }</FormLabel>
							<FormInput
								name="blogdescription"
								id="blogdescription"
								data-tip-target="site-tagline-input"
								value={ fields.blogdescription || '' }
								onChange={ onChangeField( 'blogdescription' ) }
								disabled={ isRequestingSettings }
								onClick={ eventTracker( 'Clicked Site Tagline Field' ) }
								onKeyPress={ uniqueEventTracker( 'Typed in Site Tagline Field' ) }
							/>
							<FormSettingExplanation>
								{ translate( 'In a few words, explain what this site is about.' ) }
							</FormSettingExplanation>
						</FormFieldset>
					</div>
					<SiteIconSetting />
				</div>
				{ ! isWPForTeamsSite && (
					<div className="site-settings__fiverr-logo-maker-cta">
						<div className="site-settings__fiverr-logo-icon">
							<img
								className="site-settings__fiverr-logo-cta"
								src={ fiverrLogo }
								alt="fiverr small logo"
							/>
						</div>
						<div className="site-settings__fiverr-logo-maker-cta-text">
							<div className="site-settings__fiverr-logo-maker-cta-text-title">
								{ translate( 'Make an incredible logo in minutes' ) }
							</div>
							<div className="site-settings__fiverr-logo-maker-cta-text-subhead">
								{ translate( 'Pre-designed by top talent. Just add your touch.' ) }
							</div>
						</div>
						<div className="site-settings__fiver-cta-button">
							<Button
								target="_blank"
								href="https://wp.me/logo-maker/?utm_campaign=general_settings"
								onClick={ this.trackFiverrLogoMakerClick }
							>
								<Gridicon icon="external" />
								{ translate( 'Try Fiverr Logo Maker' ) }
							</Button>
						</div>
					</div>
				) }
			</>
		);
	}

	toolbarOption() {
		const { isRequestingSettings, isSavingSettings, siteIsJetpack, siteIsAtomic } = this.props;

		const isNonAtomicJetpackSite = siteIsJetpack && ! siteIsAtomic;

		return (
			<>
				{ isNonAtomicJetpackSite && (
					// Masterbar can't be turned off on Atomic sites - don't show the toggle in that case
					<Masterbar
						isSavingSettings={ isSavingSettings }
						isRequestingSettings={ isRequestingSettings }
					/>
				) }
			</>
		);
	}

	WordPressVersion() {
		const { translate, selectedSite } = this.props;

		return (
			<Fragment>
				<strong> { translate( 'WordPress Version' ) + ': ' } </strong>
				<p className="site-settings__wordpress-version">
					{ get( selectedSite, 'options.software_version' ) }
				</p>
			</Fragment>
		);
	}

	blogAddress() {
		const { site, siteIsJetpack, siteSlug, translate, isWPForTeamsSite } = this.props;
		if ( ! site || siteIsJetpack || isWPForTeamsSite ) {
			return null;
		}

		return (
			<FormFieldset className="site-settings__has-divider">
				<FormLabel htmlFor="blogaddress">{ translate( 'Site address' ) }</FormLabel>
				<div className="site-settings__blogaddress-settings">
					<FormInput
						name="blogaddress"
						id="blogaddress"
						value={ site.domain }
						disabled="disabled"
					/>
					<Button href={ '/domains/add/' + siteSlug } onClick={ this.trackUpgradeClick }>
						<Gridicon icon="plus" />{ ' ' }
						{ translate( 'Add custom address', { context: 'Site address, domain' } ) }
					</Button>
				</div>
				<FormSettingExplanation>
					{ translate(
						'Buy a {{domainSearchLink}}custom domain{{/domainSearchLink}}, ' +
							'{{mapDomainLink}}map{{/mapDomainLink}} a domain you already own, ' +
							'or {{redirectLink}}redirect{{/redirectLink}} this site.',
						{
							components: {
								domainSearchLink: (
									<a href={ '/domains/add/' + siteSlug } onClick={ this.trackUpgradeClick } />
								),
								mapDomainLink: (
									<a
										href={ '/domains/add/mapping/' + siteSlug }
										onClick={ this.trackUpgradeClick }
									/>
								),
								redirectLink: (
									<a
										href={ '/domains/add/site-redirect/' + siteSlug }
										onClick={ this.trackUpgradeClick }
									/>
								),
							},
						}
					) }
					&nbsp;
					{ site.domain.endsWith( '.wordpress.com' ) && (
						<a href={ domainManagementEdit( siteSlug, site.domain ) }>
							{ translate( 'You can change your site address in Domain Settings.' ) }
						</a>
					) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	trackUpgradeClick = () => {
		this.props.recordTracksEvent( 'calypso_upgrade_nudge_cta_click', {
			cta_name: 'settings_site_address',
		} );
	};

	trackAdvancedCustomizationUpgradeClick = () => {
		this.props.recordTracksEvent( 'calypso_global_styles_gating_settings_notice_upgrade_click', {
			cta_name: 'settings_site_privacy',
		} );
	};

	trackFiverrLogoMakerClick = () => {
		this.props.recordTracksEvent( 'calypso_site_icon_fiverr_logo_maker_cta_click', {
			cta_name: 'site_icon_fiverr_logo_maker',
		} );
	};

	renderLanguagePickerNotice = () => {
		const { fields, translate } = this.props;
		const langId = get( fields, 'lang_id', '' );
		const errors = {
			error_cap: {
				text: translate( 'The Site Language setting is disabled due to insufficient permissions.' ),
				link: localizeUrl( 'https://wordpress.com/support/user-roles/' ),
				linkText: translate( 'More info' ),
			},
			error_const: {
				text: translate(
					'The Site Language setting is disabled because your site has the WPLANG constant set.'
				),
				link: 'https://codex.wordpress.org/Installing_WordPress_in_Your_Language#Setting_the_language_for_your_site',
				//don't know if this will ever trigger on a .com site?
				linkText: translate( 'More info' ),
			},
		};
		const noticeContent = errors[ langId ];
		if ( ! noticeContent ) {
			return null;
		}

		return (
			<Notice
				text={ noticeContent.text }
				className="site-settings__language-picker-notice"
				isCompact
			>
				<NoticeAction href={ noticeContent.link } external>
					{ noticeContent.linkText }
				</NoticeAction>
			</Notice>
		);
	};

	languageOptions() {
		const { eventTracker, fields, isRequestingSettings, onChangeField, siteIsJetpack, translate } =
			this.props;
		const errorNotice = this.renderLanguagePickerNotice();

		return (
			<FormFieldset className={ siteIsJetpack && 'site-settings__has-divider is-top-only' }>
				<FormLabel htmlFor="lang_id">{ translate( 'Language' ) }</FormLabel>
				{ errorNotice }
				<SiteLanguagePicker
					languages={ languages }
					valueKey={ siteIsJetpack ? 'wpLocale' : 'value' }
					value={ errorNotice ? 'en_US' : fields.lang_id }
					onChange={ onChangeField( 'lang_id' ) }
					disabled={ isRequestingSettings || ( siteIsJetpack && errorNotice ) }
					onClick={ eventTracker( 'Clicked Language Field' ) }
					showEmpathyModeControl={ false }
					getIncompleteLocaleNoticeMessage={ this.getIncompleteLocaleNoticeMessage }
				/>
				<FormSettingExplanation>
					{ translate( "The site's primary language." ) }
					&nbsp;
					<a href="/me/account">
						{ translate( "You can also modify your interface's language in your profile." ) }
					</a>
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	visibilityOptionsComingSoon() {
		const {
			fields,
			isAtomicAndEditingToolkitDeactivated,
			isRequestingSettings,
			isWpcomStagingSite,
			isWPForTeamsSite,
			eventTracker,
			siteIsJetpack,
			siteIsAtomic,
			translate,
			shouldShowPremiumStylesNotice,
			isSavingSettings,
			hasSitePreviewLink,
			siteId,
			site,
			isComingSoon,
		} = this.props;

		const blogPublic = parseInt( fields.blog_public, 10 );
		const wpcomComingSoon = 1 === parseInt( fields.wpcom_coming_soon, 10 );
		const wpcomPublicComingSoon = 1 === parseInt( fields.wpcom_public_coming_soon, 10 );
		// isPrivateAndUnlaunched means it is an unlaunched coming soon v1 site
		const isPrivateAndUnlaunched = -1 === blogPublic && this.props.isUnlaunchedSite;
		const isNonAtomicJetpackSite = siteIsJetpack && ! siteIsAtomic;
		const isAnyComingSoonEnabled =
			( 0 === blogPublic && wpcomPublicComingSoon ) || isPrivateAndUnlaunched || wpcomComingSoon;
		const isComingSoonDisabled = isRequestingSettings || isAtomicAndEditingToolkitDeactivated;
		const comingSoonFormLabelClasses = classNames(
			'site-settings__visibility-label is-coming-soon',
			{
				'is-coming-soon-disabled': isComingSoonDisabled,
			}
		);
		const showPreviewLink = isComingSoon && hasSitePreviewLink;

		const PublicFormRadio = () => (
			<FormLabel className="site-settings__visibility-label is-public">
				<FormRadio
					name="blog_public"
					value="1"
					checked={
						( wpcomPublicComingSoon && blogPublic === 0 && isComingSoonDisabled ) ||
						( blogPublic === 0 && ! wpcomPublicComingSoon ) ||
						blogPublic === 1
					}
					onChange={ () =>
						this.handleVisibilityOptionChange( {
							blog_public: isWpcomStagingSite ? 0 : 1,
							wpcom_coming_soon: 0,
							wpcom_public_coming_soon: 0,
						} )
					}
					disabled={ isRequestingSettings }
					onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
					label={ translate( 'Public' ) }
				/>
			</FormLabel>
		);

		return (
			<FormFieldset>
				{ ! isNonAtomicJetpackSite &&
					! isWPForTeamsSite &&
					! isAtomicAndEditingToolkitDeactivated && (
						<>
							{ shouldShowPremiumStylesNotice && this.advancedCustomizationNotice() }
							<FormLabel className={ comingSoonFormLabelClasses }>
								<FormRadio
									name="blog_public"
									value="0"
									checked={ isAnyComingSoonEnabled }
									onChange={ () =>
										this.handleVisibilityOptionChange( {
											blog_public: 0,
											wpcom_coming_soon: 0,
											wpcom_public_coming_soon: 1,
										} )
									}
									disabled={ isComingSoonDisabled }
									onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
									label={ translate( 'Coming Soon' ) }
								/>
							</FormLabel>
							<FormSettingExplanation>
								{ translate(
									'Your site is hidden from visitors behind a "Coming Soon" notice until it is ready for viewing.'
								) }
							</FormSettingExplanation>
							{ showPreviewLink && (
								<div className="site-settings__visibility-label is-checkbox">
									<SitePreviewLink
										siteUrl={ site.URL }
										siteId={ siteId }
										disabled={ ! isAnyComingSoonEnabled || isSavingSettings }
										forceOff={ ! isAnyComingSoonEnabled }
										source="privacy-settings"
									/>
								</div>
							) }
						</>
					) }
				{ isWpcomStagingSite && (
					<>
						<PublicFormRadio />
						<FormSettingExplanation>
							{ translate(
								'Your site is visible to everyone, but search engines are discouraged from indexing staging sites.'
							) }
						</FormSettingExplanation>
					</>
				) }
				{ ! isNonAtomicJetpackSite && ! isWpcomStagingSite && <PublicFormRadio /> }
				{ ! isWpcomStagingSite && (
					<>
						<FormSettingExplanation>
							{ translate( 'Your site is visible to everyone.' ) }
						</FormSettingExplanation>
						<FormLabel className="site-settings__visibility-label is-checkbox is-hidden">
							<FormInputCheckbox
								name="blog_public"
								value="0"
								checked={
									( wpcomPublicComingSoon && blogPublic === 0 && isComingSoonDisabled ) ||
									( 0 === blogPublic && ! wpcomPublicComingSoon )
								}
								onChange={ () =>
									this.handleVisibilityOptionChange( {
										blog_public:
											wpcomPublicComingSoon || blogPublic === -1 || blogPublic === 1 ? 0 : 1,
										wpcom_coming_soon: 0,
										wpcom_public_coming_soon: 0,
									} )
								}
								disabled={ isRequestingSettings }
								onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
							/>
							<span>{ translate( 'Discourage search engines from indexing this site' ) }</span>
							<FormSettingExplanation>
								{ translate(
									'This option does not block access to your site — it is up to search engines to honor your request.'
								) }
							</FormSettingExplanation>
						</FormLabel>
					</>
				) }
				{ ! isNonAtomicJetpackSite && (
					<>
						<FormLabel className="site-settings__visibility-label is-private">
							<FormRadio
								name="blog_public"
								value="-1"
								checked={
									( -1 === blogPublic && ! wpcomComingSoon && ! isPrivateAndUnlaunched ) ||
									( wpcomComingSoon && isAtomicAndEditingToolkitDeactivated )
								}
								onChange={ () =>
									this.handleVisibilityOptionChange( {
										blog_public: -1,
										wpcom_coming_soon: 0,
										wpcom_public_coming_soon: 0,
									} )
								}
								disabled={ isRequestingSettings }
								onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
								label={ translate( 'Private' ) }
							/>
						</FormLabel>
						<FormSettingExplanation>
							{ translate(
								'Your site is only visible to you and logged-in members you approve. Everyone else will see a log in screen.'
							) }
						</FormSettingExplanation>
					</>
				) }
			</FormFieldset>
		);
	}

	handleVisibilityOptionChange = ( {
		blog_public,
		wpcom_coming_soon,
		wpcom_public_coming_soon,
	} ) => {
		const { trackEvent, updateFields } = this.props;
		trackEvent( `Set blog_public to ${ blog_public }` );
		trackEvent( `Set wpcom_coming_soon to ${ wpcom_coming_soon }` );
		trackEvent( `Set wpcom_public_coming_soon to ${ wpcom_public_coming_soon }` );
		updateFields( { blog_public, wpcom_coming_soon, wpcom_public_coming_soon } );
	};

	Timezone() {
		const { fields, isRequestingSettings, translate } = this.props;
		const guessedTimezone = guessTimezone();
		const setGuessedTimezone = this.onTimezoneSelect.bind( this, guessedTimezone );

		return (
			<FormFieldset>
				<FormLabel htmlFor="blogtimezone" id="site-settings__blogtimezone">
					{ translate( 'Site timezone' ) }
				</FormLabel>

				<Timezone
					selectedZone={ fields.timezone_string }
					disabled={ isRequestingSettings }
					onSelect={ this.onTimezoneSelect }
					id="blogtimezone"
				/>

				<FormSettingExplanation>
					{ translate( 'Choose a city in your timezone.' ) }{ ' ' }
					{ guessedTimezone &&
						translate(
							'You might want to follow our guess: {{button}}Select %(timezoneName)s{{/button}}',
							{
								args: {
									timezoneName: guessedTimezone,
								},
								components: {
									button: (
										<Button
											onClick={ setGuessedTimezone }
											borderless
											compact
											className="site-settings__general-settings-set-guessed-timezone"
										/>
									),
								},
							}
						) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	recordTracksEventForTrialNoticeClick = () => {
		const { recordTracksEvent, isSiteOnECommerceTrial } = this.props;
		const eventName = isSiteOnECommerceTrial
			? `calypso_ecommerce_trial_launch_banner_click`
			: `calypso_migration_trial_launch_banner_click`;
		recordTracksEvent( eventName );
	};

	getTrialUpsellNotice() {
		const { translate, siteSlug, isSiteOnECommerceTrial, isSiteOnMigrationTrial, isLaunchable } =
			this.props;
		if ( isLaunchable ) {
			return null;
		}
		let noticeText;
		if ( isSiteOnECommerceTrial ) {
			noticeText = translate(
				'Before you can share your store with the world, you need to {{a}}pick a plan{{/a}}.',
				{
					components: {
						a: (
							<a
								href={ `/plans/${ siteSlug }` }
								onClick={ this.recordTracksEventForTrialNoticeClick }
							/>
						),
					},
				}
			);
		} else if ( isSiteOnMigrationTrial ) {
			noticeText = translate( 'Ready to launch your site? {{a}}Upgrade to a paid plan{{/a}}.', {
				components: {
					a: (
						<a
							href={ `/plans/${ siteSlug }` }
							onClick={ this.recordTracksEventForTrialNoticeClick }
						/>
					),
				},
			} );
		}

		return noticeText && <TrialUpsellNotice text={ noticeText } />;
	}

	renderLaunchSite() {
		const {
			translate,
			siteDomains,
			siteSlug,
			siteId,
			isPaidPlan,
			isComingSoon,
			fields,
			hasSitePreviewLink,
			site,
			isLaunchable,
		} = this.props;

		const launchSiteClasses = classNames( 'site-settings__general-settings-launch-site-button', {
			'site-settings__disable-privacy-settings': ! siteDomains.length,
		} );
		const btnText = translate( 'Launch site' );
		let querySiteDomainsComponent;
		let btnComponent;

		if ( 0 === siteDomains.length ) {
			querySiteDomainsComponent = <QuerySiteDomains siteId={ siteId } />;
			btnComponent = <Button>{ btnText }</Button>;
		} else if ( isPaidPlan && siteDomains.length > 1 ) {
			btnComponent = (
				<Button onClick={ this.props.launchSite } disabled={ ! isLaunchable }>
					{ btnText }
				</Button>
			);
			querySiteDomainsComponent = '';
		} else {
			btnComponent = (
				<Button
					href={ `/start/launch-site?siteSlug=${ siteSlug }&source=general-settings&new=${ site.title }&search=yes` }
				>
					{ btnText }
				</Button>
			);
			querySiteDomainsComponent = '';
		}

		const blogPublic = parseInt( fields.blog_public, 10 );
		// isPrivateAndUnlaunched means it is an unlaunched coming soon v1 site
		const isPrivateAndUnlaunched = -1 === blogPublic && this.props.isUnlaunchedSite;

		const showPreviewLink = isComingSoon && hasSitePreviewLink;

		const LaunchCard = showPreviewLink ? CompactCard : Card;

		return (
			<>
				<SettingsSectionHeader title={ translate( 'Launch site' ) } />
				<LaunchCard>
					{ this.getTrialUpsellNotice() }
					<div className="site-settings__general-settings-launch-site">
						<div className="site-settings__general-settings-launch-site-text">
							<p>
								{ isComingSoon || isPrivateAndUnlaunched
									? translate(
											'Your site hasn\'t been launched yet. It is hidden from visitors behind a "Coming Soon" notice until it is launched.'
									  )
									: translate(
											"Your site hasn't been launched yet. It's private; only you can see it until it is launched."
									  ) }
							</p>
						</div>
						<div className={ launchSiteClasses }>{ btnComponent }</div>
					</div>
				</LaunchCard>
				{ showPreviewLink && (
					<Card>
						<SitePreviewLink siteUrl={ site.URL } siteId={ siteId } source="launch-settings" />
					</Card>
				) }

				{ querySiteDomainsComponent }
			</>
		);
	}

	privacySettings() {
		const { isRequestingSettings, translate, handleSubmitForm, isSavingSettings, isP2HubSite } =
			this.props;

		if ( isP2HubSite ) {
			return <></>;
		}
		return (
			<>
				<SettingsSectionHeader
					disabled={ isRequestingSettings || isSavingSettings }
					id="site-privacy-settings"
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Privacy {{learnMoreLink/}}', {
						components: {
							learnMoreLink: <InlineSupportLink supportContext="privacy" showText={ false } />,
						},
						comment: 'Privacy Settings header',
					} ) }
				/>
				<Card>
					<form> { this.visibilityOptionsComingSoon() }</form>
				</Card>
			</>
		);
	}

	// Add settings for enhanced ownership: ability to enable locked mode and add the name of a person who will inherit the site.
	enhancedOwnershipSettings() {
		const {
			translate,
			fields,
			isRequestingSettings,
			isSavingSettings,
			handleSubmitForm,
			onChangeField,
			eventTracker,
			uniqueEventTracker,
			hasLockedMode,
			hasLegacyContact,
		} = this.props;

		// if has neither locked mode nor legacy contact, return
		if ( ! hasLockedMode && ! hasLegacyContact ) {
			return;
		}

		return (
			<div className="site-settings__enhanced-ownership-container">
				<SettingsSectionHeader
					title={ translate( 'Control your legacy' ) }
					id="site-settings__enhanced-ownership-header"
					disabled={ isRequestingSettings || isSavingSettings }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
				/>
				<Card>
					<form>
						{ hasLegacyContact && (
							<FormFieldset className="site-settings__enhanced-ownership-content">
								<FormFieldset>
									<FormLabel htmlFor="legacycontact">{ translate( 'Legacy contact' ) }</FormLabel>
									<FormInput
										name="legacycontact"
										id="legacycontact"
										data-tip-target="legacy-contact-input"
										value={ fields.wpcom_legacy_contact || '' }
										onChange={ onChangeField( 'wpcom_legacy_contact' ) }
										disabled={ isRequestingSettings }
										onClick={ eventTracker( 'Clicked Legacy Contact Field' ) }
										onKeyPress={ uniqueEventTracker( 'Typed in Legacy Contact Field' ) }
									/>
								</FormFieldset>
								<FormSettingExplanation>
									{ translate( 'Choose someone to look after your site when you pass away.' ) }
								</FormSettingExplanation>
								<FormSettingExplanation>
									{ translate(
										'To take ownership of the site, we ask that the person you designate contacts us at {{a}}wordpress.com/help{{/a}} with a copy of the death certificate.',
										{
											components: {
												a: (
													<a
														href="https://wordpress.com/help"
														target="_blank"
														rel="noopener noreferrer"
													/>
												),
											},
										}
									) }
								</FormSettingExplanation>
							</FormFieldset>
						) }
						{ hasLockedMode && (
							<FormFieldset className="site-settings__enhanced-ownership-content">
								<FormLabel>{ translate( 'Locked Mode' ) }</FormLabel>
								<ToggleControl
									disabled={ isRequestingSettings || isSavingSettings }
									className="site-settings__locked-mode-toggle"
									label={ translate( 'Enable Locked Mode' ) }
									checked={ fields.wpcom_locked_mode }
									onChange={ this.props.handleToggle( 'wpcom_locked_mode' ) }
								/>
								<FormSettingExplanation>
									{ translate(
										'Prevents new posts and pages from being created as well as existing posts and pages from being edited, and closes comments site wide.'
									) }
								</FormSettingExplanation>
							</FormFieldset>
						) }
					</form>
				</Card>
			</div>
		);
	}

	giftOptions() {
		const {
			translate,
			fields,
			isRequestingSettings,
			isSavingSettings,
			handleSubmitForm,
			hasSubscriptionGifting,
		} = this.props;

		if ( ! isEnabled( 'subscription-gifting' ) ) {
			return;
		}

		if ( hasSubscriptionGifting ) {
			return (
				<>
					<div className="site-settings__gifting-container">
						<SettingsSectionHeader
							title={ translate( 'Accept a gift subscription' ) }
							id="site-settings__gifting-header"
							disabled={ isRequestingSettings || isSavingSettings }
							isSaving={ isSavingSettings }
							onButtonClick={ handleSubmitForm }
							showButton
						/>
						<CompactCard className="site-settings__gifting-content">
							<ToggleControl
								disabled={ isRequestingSettings || isSavingSettings }
								className="site-settings__gifting-toggle"
								label={ translate(
									'Allow site visitors to gift your plan and domain renewal costs'
								) }
								checked={ fields.wpcom_gifting_subscription }
								onChange={ this.props.handleToggle( 'wpcom_gifting_subscription' ) }
							/>
							<FormSettingExplanation>
								{ translate(
									"Allow a site visitor to cover the full cost of your site's WordPress.com plan."
								) }
								<InlineSupportLink supportContext="gift-a-subscription" showIcon={ false }>
									{ translate( 'Learn more.' ) }
								</InlineSupportLink>
							</FormSettingExplanation>
						</CompactCard>
					</div>
				</>
			);
		}
	}

	builtByUpsell() {
		const { translate, site, isUnlaunchedSite: propsisUnlaunchedSite } = this.props;

		// Do not show for launched sites
		if ( ! propsisUnlaunchedSite ) {
			return;
		}

		// Do not show if we don't know when the site was created
		if ( ! site?.options?.created_at ) {
			return;
		}

		// Do not show if the site is less than 4 days old
		const siteCreatedAt = Date.parse( site?.options?.created_at );
		const FOUR_DAYS_IN_MILLISECONDS = 4 * 24 * 60 * 60 * 1000;
		if ( Date.now() - siteCreatedAt < FOUR_DAYS_IN_MILLISECONDS ) {
			return;
		}

		return (
			<Banner
				className="site-settings__built-by-upsell"
				title={ translate( 'We’ll build your site for you' ) }
				description={ translate(
					'Leave the heavy lifting to us and let our professional builders craft your compelling website.'
				) }
				callToAction={ translate( 'Get started' ) }
				href="https://wordpress.com/website-design-service/?ref=unlaunched-settings"
				target="_blank"
				iconPath={ builtByLogo }
				disableCircle={ true }
				event="settings_bb_upsell"
				tracksImpressionName="calypso_settings_bb_upsell_impression"
				tracksClickName="calypso_settings_bb_upsell_cta_click"
			/>
		);
	}

	render() {
		const {
			customizerUrl,
			handleSubmitForm,
			hasNoWpcomBranding,
			isRequestingSettings,
			isSavingSettings,
			isWPForTeamsSite,
			site,
			siteIsJetpack,
			siteIsAtomic,
			translate,
			isAtomicAndEditingToolkitDeactivated,
			isWpcomStagingSite,
		} = this.props;

		const classes = classNames( 'site-settings__general-settings', {
			'is-loading': isRequestingSettings,
		} );

		return (
			<div className={ classNames( classes ) }>
				{ site && <QuerySiteSettings siteId={ site.ID } /> }

				<SettingsSectionHeader
					data-tip-target="settings-site-profile-save"
					disabled={ isRequestingSettings || isSavingSettings }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Site profile' ) }
				/>
				<Card>
					<form>
						{ this.siteOptions() }
						{ this.blogAddress() }
						{ this.languageOptions() }
						{ this.Timezone() }
						{ siteIsJetpack && this.WordPressVersion() }
					</form>
				</Card>

				{ this.props.isUnlaunchedSite &&
				! isAtomicAndEditingToolkitDeactivated &&
				! isWpcomStagingSite
					? this.renderLaunchSite()
					: this.privacySettings() }
				{ this.enhancedOwnershipSettings() }
				{ this.builtByUpsell() }
				{ ! isWpcomStagingSite && this.giftOptions() }
				{ ! isWPForTeamsSite && ! ( siteIsJetpack && ! siteIsAtomic ) && (
					<div className="site-settings__footer-credit-container">
						<SettingsSectionHeader
							title={ translate( 'Footer credit' ) }
							id="site-settings__footer-credit-header"
						/>
						<CompactCard className="site-settings__footer-credit-explanation">
							<p>
								{ preventWidows(
									translate(
										'You can customize your website by changing the footer credit in customizer.'
									),
									2
								) }
							</p>
							<div>
								<Button className="site-settings__footer-credit-change" href={ customizerUrl }>
									{ translate( 'Change footer credit' ) }
								</Button>
							</div>
						</CompactCard>
						{ ! hasNoWpcomBranding && (
							<UpsellNudge
								feature={ WPCOM_FEATURES_NO_WPCOM_BRANDING }
								plan={ PLAN_BUSINESS }
								title={ translate(
									'Remove the footer credit entirely with WordPress.com Business'
								) }
								description={ translate(
									'Upgrade to remove the footer credit, use advanced SEO tools and more'
								) }
								showIcon={ true }
								event="settings_remove_footer"
								tracksImpressionName="calypso_upgrade_nudge_impression"
								tracksClickName="calypso_upgrade_nudge_cta_click"
							/>
						) }
					</div>
				) }
				{ this.toolbarOption() }
			</div>
		);
	}

	advancedCustomizationNotice() {
		const { translate, selectedSite, siteSlug } = this.props;
		const upgradeUrl = `/plans/${ siteSlug }?plan=${ PLAN_PREMIUM }&feature=${ FEATURE_STYLE_CUSTOMIZATION }`;

		return (
			<>
				<div className="site-settings__advanced-customization-notice">
					<div className="site-settings__advanced-customization-notice-cta">
						<Gridicon icon="info-outline" />
						<span>
							{ translate(
								'Your site contains premium styles that will only be visible once you upgrade to a Premium plan.'
							) }
						</span>
					</div>
					<div className="site-settings__advanced-customization-notice-buttons">
						<Button href={ selectedSite.URL } target="_blank">
							{ translate( 'View site' ) }
						</Button>
						<Button
							className="is-primary"
							href={ upgradeUrl }
							onClick={ this.trackAdvancedCustomizationUpgradeClick }
						>
							{ translate( 'Upgrade' ) }
						</Button>
					</div>
				</div>
			</>
		);
	}
}

const mapDispatchToProps = ( dispatch, ownProps ) => {
	const { site } = ownProps;

	return {
		launchSite: () => dispatch( launchSite( site.ID ) ),
	};
};

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		customizerUrl: getCustomizerUrl( state, siteId, 'identity' ),
		hasNoWpcomBranding: siteHasFeature( state, siteId, WPCOM_FEATURES_NO_WPCOM_BRANDING ),
		isAtomicAndEditingToolkitDeactivated:
			isAtomicSite( state, siteId ) &&
			getSiteOption( state, siteId, 'editing_toolkit_is_active' ) === false,
		isComingSoon: isSiteComingSoon( state, siteId ),
		isP2HubSite: isSiteP2Hub( state, siteId ),
		isPaidPlan: isCurrentPlanPaid( state, siteId ),
		isUnlaunchedSite: isUnlaunchedSite( state, siteId ),
		isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
		isWpcomStagingSite: isSiteWpcomStaging( state, siteId ),
		selectedSite: getSelectedSite( state ),
		siteDomains: getDomainsBySiteId( state, siteId ),
		siteIsJetpack: isJetpackSite( state, siteId ),
		siteSlug: getSelectedSiteSlug( state ),
		hasSubscriptionGifting: siteHasFeature( state, siteId, WPCOM_FEATURES_SUBSCRIPTION_GIFTING ),
		hasLockedMode: siteHasFeature( state, siteId, WPCOM_FEATURES_LOCKED_MODE ),
		hasLegacyContact: siteHasFeature( state, siteId, WPCOM_FEATURES_LEGACY_CONTACT ),
		hasSitePreviewLink: siteHasFeature( state, siteId, WPCOM_FEATURES_SITE_PREVIEW_LINKS ),
		isSiteOnECommerceTrial: getIsSiteOnECommerceTrial( state, siteId ),
		isSiteOnMigrationTrial: getIsSiteOnMigrationTrial( state, siteId ),
		isLaunchable:
			! getIsSiteOnECommerceTrial( state, siteId ) && ! getIsSiteOnMigrationTrial( state, siteId ),
	};
}, mapDispatchToProps );

const getFormSettings = ( settings ) => {
	const defaultSettings = {
		blogname: '',
		blogdescription: '',
		lang_id: '',
		timezone_string: '',
		blog_public: '',
		wpcom_coming_soon: '',
		wpcom_legacy_contact: '',
		wpcom_locked_mode: false,
		wpcom_public_coming_soon: '',
		wpcom_gifting_subscription: false,
		admin_url: '',
	};

	if ( ! settings ) {
		return defaultSettings;
	}

	const formSettings = {
		blogname: settings.blogname,
		blogdescription: settings.blogdescription,

		lang_id: settings.lang_id,
		blog_public: settings.blog_public,
		timezone_string: settings.timezone_string,

		wpcom_coming_soon: settings.wpcom_coming_soon,
		wpcom_legacy_contact: settings.wpcom_legacy_contact,
		wpcom_locked_mode: settings.wpcom_locked_mode,
		wpcom_public_coming_soon: settings.wpcom_public_coming_soon,
		wpcom_gifting_subscription: !! settings.wpcom_gifting_subscription,
	};

	// handling `gmt_offset` and `timezone_string` values
	const gmt_offset = settings.gmt_offset;

	if ( ! settings.timezone_string && typeof gmt_offset === 'string' && gmt_offset.length ) {
		formSettings.timezone_string = 'UTC' + ( /-/.test( gmt_offset ) ? '' : '+' ) + gmt_offset;
	}

	return formSettings;
};

const SiteSettingsFormGeneralWithGlobalStylesNotice = ( props ) => {
	const { globalStylesInUse, shouldLimitGlobalStyles } = useSiteGlobalStylesStatus(
		props.site?.ID
	);

	return (
		<SiteSettingsFormGeneral
			{ ...props }
			shouldShowPremiumStylesNotice={ globalStylesInUse && shouldLimitGlobalStyles }
		/>
	);
};

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormGeneralWithGlobalStylesNotice );
