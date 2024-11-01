import { isEnabled } from '@automattic/calypso-config';
import {
	PLAN_BUSINESS,
	WPCOM_FEATURES_NO_WPCOM_BRANDING,
	WPCOM_FEATURES_SITE_PREVIEW_LINKS,
	getPlan,
} from '@automattic/calypso-products';
import {
	WPCOM_FEATURES_SUBSCRIPTION_GIFTING,
	WPCOM_FEATURES_LOCKED_MODE,
	WPCOM_FEATURES_LEGACY_CONTACT,
} from '@automattic/calypso-products/src';
import { Card, CompactCard, Button, FormLabel, Gridicon } from '@automattic/components';
import { guessTimezone, localizeUrl } from '@automattic/i18n-utils';
import languages from '@automattic/languages';
import { ToggleControl } from '@wordpress/components';
import clsx from 'clsx';
import { flowRight, get } from 'lodash';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import fiverrLogo from 'calypso/assets/images/customer-home/fiverr-logo.svg';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SiteLanguagePicker from 'calypso/components/language-picker/site-language-picker';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import Timezone from 'calypso/components/timezone';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import { preventWidows } from 'calypso/lib/formatting';
import scrollToAnchor from 'calypso/lib/scroll-to-anchor';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import SiteSettingPrivacy from 'calypso/my-sites/site-settings/site-setting-privacy';
import getTimezonesLabels from 'calypso/state/selectors/get-timezones-labels';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import {
	isSiteOnECommerceTrial as getIsSiteOnECommerceTrial,
	isSiteOnMigrationTrial as getIsSiteOnMigrationTrial,
} from 'calypso/state/sites/plans/selectors';
import {
	getSiteOption,
	isAdminInterfaceWPAdmin,
	isJetpackSite,
	isCurrentPlanPaid,
	getCustomizerUrl,
	isSimpleSite,
} from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { A4AFullyManagedSiteSetting } from './a4a-fully-managed-site-setting';
import { DIFMUpsell } from './difm-upsell-banner';
import Masterbar from './masterbar';
import SiteAdminInterface from './site-admin-interface';
import SiteIconSetting from './site-icon-setting';
import LaunchSite from './site-visibility/launch-site';
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
					<Button
						href={ '/domains/add/' + siteSlug + '?redirect_to=/settings/general/' + siteSlug }
						onClick={ this.trackUpgradeClick }
					>
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
									<a
										href={
											'/domains/add/' + siteSlug + '?redirect_to=/settings/general/' + siteSlug
										}
										onClick={ this.trackUpgradeClick }
									/>
								),
								mapDomainLink: (
									<a
										href={
											'/domains/add/mapping/' +
											siteSlug +
											'?redirect_to=/settings/general/' +
											siteSlug
										}
										onClick={ this.trackUpgradeClick }
									/>
								),
								redirectLink: (
									<a
										href={
											'/domains/add/site-redirect/' +
											siteSlug +
											'?redirect_to=/settings/general/' +
											siteSlug
										}
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

	Timezone() {
		const { fields, isRequestingSettings, translate, timezonesLabels } = this.props;
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
									timezoneName: timezonesLabels?.[ guessedTimezone ] ?? guessedTimezone,
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

	privacySettings() {
		const { fields, handleSubmitForm, updateFields, isRequestingSettings, isSavingSettings } =
			this.props;
		return (
			<SiteSettingPrivacy
				fields={ fields }
				handleSubmitForm={ handleSubmitForm }
				updateFields={ updateFields }
				isRequestingSettings={ isRequestingSettings }
				isSavingSettings={ isSavingSettings }
			/>
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

	renderAdminInterface() {
		const { site, siteSlug } = this.props;
		return <SiteAdminInterface siteId={ site.ID } siteSlug={ siteSlug } />;
	}

	render() {
		const {
			customizerUrl,
			fields,
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
			isUnlaunchedSite: propsisUnlaunchedSite,
			adminInterfaceIsWPAdmin,
			hasBlockTheme,
		} = this.props;
		const classes = clsx( 'site-settings__general-settings', {
			'is-loading': isRequestingSettings,
		} );
		const isDevelopmentSite = Boolean( site?.is_a4a_dev_site );

		if ( ! site ) {
			return null;
		}

		return (
			<div className={ clsx( classes ) }>
				{ site && <QuerySiteSettings siteId={ site.ID } /> }

				{ ! adminInterfaceIsWPAdmin && (
					<>
						<SettingsSectionHeader
							disabled={ isRequestingSettings || isSavingSettings }
							isSaving={ isSavingSettings }
							onButtonClick={ handleSubmitForm }
							showButton
							title={ translate( 'Site profile' ) }
							buttonProps={ {
								'data-tip-target': 'settings-site-profile-save',
							} }
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
					</>
				) }

				{ this.props.isUnlaunchedSite &&
				! isAtomicAndEditingToolkitDeactivated &&
				! isWpcomStagingSite ? (
					<LaunchSite />
				) : (
					this.privacySettings()
				) }
				<A4AFullyManagedSiteSetting
					site={ site }
					isFullyManagedAgencySite={ fields.is_fully_managed_agency_site }
					onChange={ this.props.handleToggle( 'is_fully_managed_agency_site' ) }
					isSaving={ isSavingSettings }
					onSaveSetting={ handleSubmitForm }
					disabled={ isRequestingSettings || isSavingSettings }
				/>
				{ this.enhancedOwnershipSettings() }
				<DIFMUpsell
					site={ site }
					isUnlaunchedSite={ propsisUnlaunchedSite }
					urlRef="unlaunched-settings"
				/>
				{ ! isDevelopmentSite && this.renderAdminInterface() }
				{ ! isWpcomStagingSite && this.giftOptions() }
				{ ! isWPForTeamsSite && ! ( siteIsJetpack && ! siteIsAtomic ) && (
					<>
						{ ! hasBlockTheme && (
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
											'Remove the footer credit entirely with WordPress.com %(businessPlanName)s',

											{ args: { businessPlanName: getPlan( PLAN_BUSINESS ).getTitle() } }
										) }
										description={ translate(
											'Upgrade to remove the footer credit, use advanced SEO tools and more'
										) }
										showIcon
										event="settings_remove_footer"
										tracksImpressionName="calypso_upgrade_nudge_impression"
										tracksClickName="calypso_upgrade_nudge_cta_click"
									/>
								) }
							</div>
						) }
					</>
				) }
				{ this.toolbarOption() }
			</div>
		);
	}
}

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		customizerUrl: getCustomizerUrl( state, siteId, 'identity' ),
		hasNoWpcomBranding: siteHasFeature( state, siteId, WPCOM_FEATURES_NO_WPCOM_BRANDING ),
		isAtomicAndEditingToolkitDeactivated:
			isAtomicSite( state, siteId ) &&
			getSiteOption( state, siteId, 'editing_toolkit_is_active' ) === false,
		adminInterfaceIsWPAdmin: isAdminInterfaceWPAdmin( state, siteId ),
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
		isSimple: isSimpleSite( state, siteId ),
		timezonesLabels: getTimezonesLabels( state ),
	};
} );

const getFormSettings = ( settings ) => {
	const defaultSettings = {
		blogname: '',
		blogdescription: '',
		lang_id: '',
		timezone_string: '',
		blog_public: '',
		wpcom_coming_soon: '',
		wpcom_data_sharing_opt_out: false,
		wpcom_legacy_contact: '',
		wpcom_locked_mode: false,
		wpcom_public_coming_soon: '',
		wpcom_gifting_subscription: false,
		admin_url: '',
		is_fully_managed_agency_site: true,
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

		is_fully_managed_agency_site: settings.is_fully_managed_agency_site,

		wpcom_coming_soon: settings.wpcom_coming_soon,
		wpcom_data_sharing_opt_out: !! settings.wpcom_data_sharing_opt_out,
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
	const { data: activeThemeData } = useActiveThemeQuery( props.site?.ID ?? -1, !! props.site );
	const hasBlockTheme = activeThemeData?.[ 0 ]?.is_block_theme ?? false;

	return (
		<SiteSettingsFormGeneral
			{ ...props }
			shouldShowPremiumStylesNotice={ globalStylesInUse && shouldLimitGlobalStyles }
			hasBlockTheme={ hasBlockTheme }
		/>
	);
};

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormGeneralWithGlobalStylesNotice );
