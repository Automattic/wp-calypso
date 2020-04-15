/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { flowRight, get, has } from 'lodash';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import { Card, CompactCard, Button } from '@automattic/components';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import LanguagePicker from 'components/language-picker';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import config from 'config';
import { abtest } from 'lib/abtest';
import { languages } from 'languages';
import FormInput from 'components/forms/form-text-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Timezone from 'components/timezone';
import SiteIconSetting from './site-icon-setting';
import UpsellNudge from 'blocks/upsell-nudge';
import { isBusiness } from 'lib/products-values';
import { FEATURE_NO_BRANDING, PLAN_BUSINESS } from 'lib/plans/constants';
import QuerySiteSettings from 'components/data/query-site-settings';
import { isJetpackSite, isCurrentPlanPaid } from 'state/sites/selectors';
import isSiteComingSoon from 'state/selectors/is-site-coming-soon';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import guessTimezone from 'lib/i18n-utils/guess-timezone';
import { preventWidows } from 'lib/formatting';
import scrollTo from 'lib/scroll-to';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import isVipSite from 'state/selectors/is-vip-site';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { launchSite } from 'state/sites/launch/actions';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import QuerySiteDomains from 'components/data/query-site-domains';
import FormInputCheckbox from 'components/forms/form-checkbox';
import { hasLocalizedText } from 'blocks/eligibility-warnings/has-localized-text';

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

	onTimezoneSelect = timezone => {
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
		} = this.props;

		return (
			<div className="site-settings__site-options">
				<div className="site-settings__site-title-tagline">
					<FormFieldset>
						<FormLabel htmlFor="blogname">{ translate( 'Site Title' ) }</FormLabel>
						<FormInput
							name="blogname"
							id="blogname"
							data-tip-target="site-title-input"
							type="text"
							value={ fields.blogname || '' }
							onChange={ onChangeField( 'blogname' ) }
							disabled={ isRequestingSettings }
							onClick={ eventTracker( 'Clicked Site Title Field' ) }
							onKeyPress={ uniqueEventTracker( 'Typed in Site Title Field' ) }
						/>
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="blogdescription">{ translate( 'Site Tagline' ) }</FormLabel>
						<FormInput
							name="blogdescription"
							type="text"
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
		);
	}

	WordPressVersion() {
		const { translate, selectedSite } = this.props;

		return (
			<FormFieldset>
				<FormLabel htmlFor="wpversion">{ translate( 'WordPress Version' ) }</FormLabel>
				<FormInput
					name="wpversion"
					id="wpversion"
					data-tip-target="site-title-input"
					type="text"
					value={ get( selectedSite, 'options.software_version' ) }
					disabled
				/>
			</FormFieldset>
		);
	}

	blogAddress() {
		const { site, siteIsJetpack, siteSlug, translate } = this.props;
		let customAddress = '',
			addressDescription = '';

		if ( ! site || siteIsJetpack ) {
			return null;
		}

		if ( config.isEnabled( 'upgrades/domain-search' ) ) {
			customAddress = (
				<Button href={ '/domains/add/' + siteSlug } onClick={ this.trackUpgradeClick }>
					<Gridicon icon="plus" />{ ' ' }
					{ translate( 'Add custom address', { context: 'Site address, domain' } ) }
				</Button>
			);

			addressDescription = (
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
				</FormSettingExplanation>
			);
		}

		return (
			<FormFieldset className="site-settings__has-divider">
				<FormLabel htmlFor="blogaddress">{ translate( 'Site Address' ) }</FormLabel>
				<div className="site-settings__blogaddress-settings">
					<FormInput
						name="blogaddress"
						type="text"
						id="blogaddress"
						value={ site.domain }
						disabled="disabled"
					/>
					{ customAddress }
				</div>
				{ addressDescription }
			</FormFieldset>
		);
	}

	trackUpgradeClick = () => {
		this.props.recordTracksEvent( 'calypso_upgrade_nudge_cta_click', {
			cta_name: 'settings_site_address',
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
				link:
					'https://codex.wordpress.org/Installing_WordPress_in_Your_Language#Setting_the_language_for_your_site',
				//don't know if this will ever trigger on a .com site?
				linkText: translate( 'More info' ),
			},
		};
		const noticeContent = errors[ langId ];

		return (
			has( noticeContent, 'text' ) && (
				<Notice
					text={ noticeContent.text }
					className="site-settings__language-picker-notice"
					isCompact
				>
					{ has( noticeContent, 'link' ) && (
						<NoticeAction href={ noticeContent.link } external>
							{ noticeContent.linkText }
						</NoticeAction>
					) }
				</Notice>
			)
		);
	};

	languageOptions() {
		const {
			eventTracker,
			fields,
			isRequestingSettings,
			onChangeField,
			siteIsJetpack,
			translate,
		} = this.props;
		const errorNotice = this.renderLanguagePickerNotice();

		return (
			<FormFieldset className={ siteIsJetpack && 'site-settings__has-divider is-top-only' }>
				<FormLabel htmlFor="lang_id">{ translate( 'Language' ) }</FormLabel>
				{ errorNotice }
				<LanguagePicker
					languages={ languages }
					valueKey={ siteIsJetpack ? 'wpLocale' : 'value' }
					value={ errorNotice ? 'en_US' : fields.lang_id }
					onChange={ onChangeField( 'lang_id' ) }
					disabled={ isRequestingSettings || ( siteIsJetpack && errorNotice ) }
					onClick={ eventTracker( 'Clicked Language Field' ) }
				/>
				<FormSettingExplanation>
					{ translate( "The site's primary language." ) }
					&nbsp;
					<a href={ config.isEnabled( 'me/account' ) ? '/me/account' : '/settings/account/' }>
						{ translate( "You can also modify your interface's language in your profile." ) }
					</a>
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	visibilityOptions() {
		const {
			fields,
			handleRadio,
			updateFields,
			isRequestingSettings,
			eventTracker,
			siteIsJetpack,
			trackEvent,
			translate,
		} = this.props;

		const currentValue = parseInt( fields.blog_public, 10 );

		return (
			<FormFieldset>
				{ ! siteIsJetpack && (
					<FormLabel className="site-settings__visibility-label">
						<FormRadio
							name="blog_public"
							value="1"
							checked={ [ 0, 1 ].indexOf( currentValue ) !== -1 }
							onChange={ handleRadio }
							disabled={ isRequestingSettings }
							onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
						/>
						<span>{ translate( 'Public' ) }</span>
					</FormLabel>
				) }

				<FormSettingExplanation isIndented>
					{ translate( 'Your site is visible to everyone.' ) }
				</FormSettingExplanation>

				<FormLabel className="site-settings__visibility-label is-checkbox">
					<FormInputCheckbox
						name="blog_public"
						value="0"
						checked={ 0 === currentValue }
						onChange={ () => {
							const newValue = currentValue === 0 ? 1 : 0;
							trackEvent( `Set blog_public to ${ newValue }` );
							updateFields( { blog_public: newValue } );
						} }
						disabled={ isRequestingSettings }
						onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
					/>
					<span>{ translate( 'Do not allow search engines to index my site' ) }</span>
				</FormLabel>

				{ ! siteIsJetpack && (
					<>
						<FormLabel className="site-settings__visibility-label">
							<FormRadio
								name="blog_public"
								value="-1"
								checked={ -1 === currentValue }
								onChange={ handleRadio }
								disabled={ isRequestingSettings }
								onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
							/>
							<span>{ translate( 'Private' ) }</span>
						</FormLabel>
						<FormSettingExplanation isIndented>
							{ translate( 'Your site is only visible to you and users you approve.' ) }
						</FormSettingExplanation>
					</>
				) }
			</FormFieldset>
		);
	}

	visibilityOptionsComingSoon() {
		const {
			fields,
			isRequestingSettings,
			eventTracker,
			siteIsJetpack,
			siteIsAtomic,
			translate,
		} = this.props;
		const blogPublic = parseInt( fields.blog_public, 10 );
		const wpcomComingSoon = parseInt( fields.wpcom_coming_soon, 10 );

		const isNonAtomicJetpackSite = siteIsJetpack && ! siteIsAtomic;

		return (
			<FormFieldset>
				{ ! isNonAtomicJetpackSite && (
					<>
						<FormLabel className="site-settings__visibility-label is-coming-soon">
							<FormRadio
								name="blog_public"
								value="-1"
								checked={ -1 === blogPublic && 1 === wpcomComingSoon }
								onChange={ () =>
									this.handleVisibilityOptionChange( {
										blog_public: -1,
										wpcom_coming_soon: 1,
									} )
								}
								disabled={ isRequestingSettings }
								onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
							/>
							<span>{ translate( 'Coming Soon' ) }</span>
						</FormLabel>
						<FormSettingExplanation isIndented>
							{ hasLocalizedText(
								'Your site is hidden from visitors behind a "Coming Soon" notice until it is ready for viewing.'
							)
								? translate(
										'Your site is hidden from visitors behind a "Coming Soon" notice until it is ready for viewing.'
								  )
								: translate( "Your site is hidden from visitors until it's ready for viewing." ) }
						</FormSettingExplanation>
					</>
				) }
				{ ! isNonAtomicJetpackSite && (
					<FormLabel className="site-settings__visibility-label is-public">
						<FormRadio
							name="blog_public"
							value="1"
							checked={ blogPublic === 0 || blogPublic === 1 }
							onChange={ () =>
								this.handleVisibilityOptionChange( {
									blog_public: 1,
									wpcom_coming_soon: 0,
								} )
							}
							disabled={ isRequestingSettings }
							onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
						/>
						<span>{ translate( 'Public' ) }</span>
					</FormLabel>
				) }
				<FormSettingExplanation isIndented>
					{ translate( 'Your site is visible to everyone.' ) }
				</FormSettingExplanation>
				<FormLabel className="site-settings__visibility-label is-checkbox is-hidden">
					<FormInputCheckbox
						name="blog_public"
						value="0"
						checked={ 0 === blogPublic }
						onChange={ () =>
							this.handleVisibilityOptionChange( {
								blog_public: blogPublic === 0 ? 1 : 0,
								wpcom_coming_soon: 0,
							} )
						}
						disabled={ isRequestingSettings }
						onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
					/>
					<span>{ translate( 'Do not allow search engines to index my site' ) }</span>
				</FormLabel>
				{ ! isNonAtomicJetpackSite && (
					<>
						<FormLabel className="site-settings__visibility-label is-private">
							<FormRadio
								name="blog_public"
								value="-1"
								checked={ -1 === blogPublic && ! wpcomComingSoon }
								onChange={ () =>
									this.handleVisibilityOptionChange( {
										blog_public: -1,
										wpcom_coming_soon: 0,
									} )
								}
								disabled={ isRequestingSettings }
								onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
							/>
							<span>{ translate( 'Private' ) }</span>
						</FormLabel>
						<FormSettingExplanation isIndented>
							{ hasLocalizedText(
								'Your site is only visible to you and logged-in members you approve. Everyone else will see a log in screen.'
							)
								? translate(
										'Your site is only visible to you and logged-in members you approve. Everyone else will see a log in screen.'
								  )
								: translate(
										'Your site is only visible to you and logged-in members you approve.'
								  ) }
						</FormSettingExplanation>
					</>
				) }
			</FormFieldset>
		);
	}

	handleVisibilityOptionChange = ( { blog_public, wpcom_coming_soon } ) => {
		const { trackEvent, updateFields } = this.props;
		trackEvent( `Set blog_public to ${ blog_public }` );
		trackEvent( `Set wpcom_coming_soon to ${ wpcom_coming_soon }` );
		updateFields( { blog_public, wpcom_coming_soon } );
	};

	Timezone() {
		const { fields, isRequestingSettings, translate } = this.props;
		const guessedTimezone = guessTimezone();
		const setGuessedTimezone = this.onTimezoneSelect.bind( this, guessedTimezone );

		return (
			<FormFieldset>
				<FormLabel htmlFor="blogtimezone">{ translate( 'Site Timezone' ) }</FormLabel>

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
		const { translate, siteDomains, siteSlug, siteId, isPaidPlan, isComingSoon } = this.props;

		const launchSiteClasses = classNames( 'site-settings__general-settings-launch-site-button', {
			'site-settings__disable-privacy-settings': ! siteDomains.length,
		} );
		const btnText = translate( 'Launch site' );
		let querySiteDomainsComponent, btnComponent;

		if ( 0 === siteDomains.length ) {
			querySiteDomainsComponent = <QuerySiteDomains siteId={ siteId } />;
			btnComponent = <Button>{ btnText }</Button>;
		} else if ( isPaidPlan && siteDomains.length > 1 ) {
			btnComponent = <Button onClick={ this.props.launchSite }>{ btnText }</Button>;
			querySiteDomainsComponent = '';
		} else {
			btnComponent = (
				<Button href={ `/start/launch-site?siteSlug=${ siteSlug }` }>{ btnText }</Button>
			);
			querySiteDomainsComponent = '';
		}

		return (
			<>
				<SettingsSectionHeader title={ translate( 'Launch site' ) } />
				<Card className="site-settings__general-settings-launch-site">
					<div className="site-settings__general-settings-launch-site-text">
						<p>
							{ isComingSoon &&
							hasLocalizedText(
								'Your site hasn\'t been launched yet. It is hidden from visitors behind a "Coming Soon" notice until it is launched.'
							)
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
		const {
			isRequestingSettings,
			translate,
			handleSubmitForm,
			isSavingSettings,
			withComingSoonOption,
		} = this.props;

		return (
			<>
				<SettingsSectionHeader
					disabled={ isRequestingSettings || isSavingSettings }
					id="site-privacy-settings"
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Privacy' ) }
				/>
				<Card>
					<form>
						{ withComingSoonOption ? this.visibilityOptionsComingSoon() : this.visibilityOptions() }
					</form>
				</Card>
			</>
		);
	}

	disablePrivacySettings = e => {
		e.target.blur();
	};

	privacySettingsWrapper() {
		if ( this.props.isUnlaunchedSite ) {
			if ( this.props.needsVerification ) {
				return (
					<EmailVerificationGate>
						{ this.renderLaunchSite() }
						{ this.privacySettings() }
					</EmailVerificationGate>
				);
			}

			return (
				<>
					{ this.renderLaunchSite() }
					<div
						className="site-settings__disable-privacy-settings"
						onFocus={ this.disablePrivacySettings }
					>
						{ this.privacySettings() }
					</div>
				</>
			);
		}

		return <>{ this.privacySettings() }</>;
	}

	render() {
		const {
			handleSubmitForm,
			isRequestingSettings,
			isSavingSettings,
			site,
			siteIsJetpack,
			siteIsVip,
			siteSlug,
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
					title={ translate( 'Site Profile' ) }
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

				{ this.privacySettingsWrapper() }

				{ ! siteIsJetpack && (
					<div className="site-settings__footer-credit-container">
						<SettingsSectionHeader title={ translate( 'Footer Credit' ) } />
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
								<Button
									className="site-settings__footer-credit-change"
									href={ '/customize/identity/' + siteSlug }
								>
									{ translate( 'Change footer credit' ) }
								</Button>
							</div>
						</CompactCard>
						{ site && ! isBusiness( site.plan ) && ! siteIsVip && (
							<UpsellNudge
								feature={ FEATURE_NO_BRANDING }
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

const connectComponent = connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const siteIsJetpack = isJetpackSite( state, siteId );
		const selectedSite = getSelectedSite( state );

		return {
			isUnlaunchedSite: isUnlaunchedSite( state, siteId ),
			isComingSoon: isSiteComingSoon( state, siteId ),
			needsVerification: ! isCurrentUserEmailVerified( state ),
			siteIsJetpack,
			siteIsVip: isVipSite( state, siteId ),
			siteSlug: getSelectedSiteSlug( state ),
			selectedSite,
			isPaidPlan: isCurrentPlanPaid( state, siteId ),
			siteDomains: getDomainsBySiteId( state, siteId ),
		};
	},
	mapDispatchToProps,
	null,
	{ pure: false }
);

const getFormSettings = settings => {
	const defaultSettings = {
		blogname: '',
		blogdescription: '',
		lang_id: '',
		timezone_string: '',
		blog_public: '',
		wpcom_coming_soon: '',
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
	};

	if ( settings.private_sites_enabled || 'variant' === abtest( 'ATPrivacy' ) ) {
		formSettings.wpcom_coming_soon = settings.wpcom_coming_soon;
	}

	// handling `gmt_offset` and `timezone_string` values
	const gmt_offset = settings.gmt_offset;

	if ( ! settings.timezone_string && typeof gmt_offset === 'string' && gmt_offset.length ) {
		formSettings.timezone_string = 'UTC' + ( /-/.test( gmt_offset ) ? '' : '+' ) + gmt_offset;
	}

	return formSettings;
};

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings ),
	connect( ( state, ownProps ) => ( {
		withComingSoonOption: ownProps.hasOwnProperty( 'withComingSoonOption' )
			? ownProps.withComingSoonOption
			: ownProps?.settings?.private_sites_enabled || 'variant' === abtest( 'ATPrivacy' ),
	} ) )
)( SiteSettingsFormGeneral );
