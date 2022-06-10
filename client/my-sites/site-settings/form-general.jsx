import { PLAN_BUSINESS, WPCOM_FEATURES_NO_WPCOM_BRANDING } from '@automattic/calypso-products';
import { Card, CompactCard, Button, Gridicon } from '@automattic/components';
import { guessTimezone } from '@automattic/i18n-utils';
import languages from '@automattic/languages';
import classNames from 'classnames';
import { flowRight, get } from 'lodash';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import fiverrLogo from 'calypso/assets/images/customer-home/fiverr-logo.svg';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
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
import Timezone from 'calypso/components/timezone';
import { preventWidows } from 'calypso/lib/formatting';
import scrollTo from 'calypso/lib/scroll-to';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { launchSite } from 'calypso/state/sites/launch/actions';
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
import SiteIconSetting from './site-icon-setting';
import wrapSettingsForm from './wrap-settings-form';

export class SiteSettingsFormGeneral extends Component {
	componentDidMount() {
		// Wait for page.js to update the URL, then see if we are linking
		// directly to a section of this page.
		setTimeout( () => {
			if ( ! window || ! window.location ) {
				// This code breaks everything in the tests (they hang with no
				// error message).
				return;
			}
			const hash = window.location.hash;
			const el = hash && document.getElementById( hash.substring( 1 ) );
			if ( hash && el ) {
				const y = el.offsetTop - document.getElementById( 'header' ).offsetHeight - 15;
				scrollTo( { y } );
			}
		} );
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
				link: 'https://wordpress.com/support/user-roles/',
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
					<a href={ '/me/account' }>
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
			isWPForTeamsSite,
			eventTracker,
			siteIsJetpack,
			siteIsAtomic,
			translate,
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
		return (
			<FormFieldset>
				{ ! isNonAtomicJetpackSite &&
					! isWPForTeamsSite &&
					! isAtomicAndEditingToolkitDeactivated && (
						<>
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
						</>
					) }
				{ ! isNonAtomicJetpackSite && (
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
									blog_public: 1,
									wpcom_coming_soon: 0,
									wpcom_public_coming_soon: 0,
								} )
							}
							disabled={ isRequestingSettings }
							onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
							label={ translate( 'Public' ) }
						/>
					</FormLabel>
				) }
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
								blog_public: wpcomPublicComingSoon || blogPublic === -1 || blogPublic === 1 ? 0 : 1,
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

	renderLaunchSite() {
		const { translate, siteDomains, siteSlug, siteId, isPaidPlan, isComingSoon, fields } =
			this.props;

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
			btnComponent = <Button onClick={ this.props.launchSite }>{ btnText }</Button>;
			querySiteDomainsComponent = '';
		} else {
			btnComponent = (
				<Button href={ `/start/launch-site?siteSlug=${ siteSlug }&source=general-settings` }>
					{ btnText }
				</Button>
			);
			querySiteDomainsComponent = '';
		}

		const blogPublic = parseInt( fields.blog_public, 10 );
		// isPrivateAndUnlaunched means it is an unlaunched coming soon v1 site
		const isPrivateAndUnlaunched = -1 === blogPublic && this.props.isUnlaunchedSite;

		return (
			<>
				<SettingsSectionHeader title={ translate( 'Launch site' ) } />
				<Card className="site-settings__general-settings-launch-site">
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
				</Card>

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

				{ this.props.isUnlaunchedSite ? this.renderLaunchSite() : this.privacySettings() }

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
							/>
						) }
					</div>
				) }
			</div>
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
		selectedSite: getSelectedSite( state ),
		siteDomains: getDomainsBySiteId( state, siteId ),
		siteIsJetpack: isJetpackSite( state, siteId ),
		siteSlug: getSelectedSiteSlug( state ),
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
		wpcom_public_coming_soon: '',
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
		wpcom_public_coming_soon: settings.wpcom_public_coming_soon,
	};

	// handling `gmt_offset` and `timezone_string` values
	const gmt_offset = settings.gmt_offset;

	if ( ! settings.timezone_string && typeof gmt_offset === 'string' && gmt_offset.length ) {
		formSettings.timezone_string = 'UTC' + ( /-/.test( gmt_offset ) ? '' : '+' ) + gmt_offset;
	}

	return formSettings;
};

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormGeneral );
