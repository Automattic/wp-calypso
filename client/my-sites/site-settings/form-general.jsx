/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import RelatedContentPreview from 'my-sites/site-settings/related-content-preview';
import LanguageSelector from 'components/forms/language-selector';
import DisconnectJetpackButton from 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-button';
import SectionHeader from 'components/section-header';
import config from 'config';
import notices from 'notices';
import FormInput from 'components/forms/form-text-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormToggle from 'components/forms/form-toggle';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Timezone from 'components/timezone';
import JetpackSyncPanel from './jetpack-sync-panel';
import SiteIconSetting from './site-icon-setting';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { isBusiness } from 'lib/products-values';
import { FEATURE_NO_BRANDING } from 'lib/plans/constants';
import QuerySiteSettings from 'components/data/query-site-settings';

class SiteSettingsFormGeneral extends Component {
	componentWillMount() {
		this._showWarning( this.props.site );
	}

	onTimezoneSelect = timezone => {
		this.props.updateFields( {
			timezone_string: timezone
		} );
	};

	siteOptions() {
		const { translate, isRequestingSettings, fields, eventTracker, onChangeField, uniqueEventTracker } = this.props;

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
							onKeyPress={ uniqueEventTracker( 'Typed in Site Title Field' ) } />
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
							onKeyPress={ uniqueEventTracker( 'Typed in Site Tagline Field' ) } />
						<FormSettingExplanation>
							{ translate( 'In a few words, explain what this site is about.' ) }
						</FormSettingExplanation>
					</FormFieldset>
				</div>
				<SiteIconSetting />
			</div>
		);
	}

	blogAddress() {
		const { site, translate } = this.props;
		let customAddress = '',
			addressDescription = '';

		if ( site.jetpack ) {
			return null;
		}

		if ( config.isEnabled( 'upgrades/domain-search' ) ) {
			customAddress = (
				<Button href={ '/domains/add/' + site.slug } onClick={ this.trackUpgradeClick }>
					<Gridicon icon="plus" /> { translate( 'Add a Custom Address', { context: 'Site address, domain' } ) }
				</Button>
			);

			addressDescription =
				<FormSettingExplanation>
					{
						translate(
							'Buy a {{domainSearchLink}}custom domain{{/domainSearchLink}}, ' +
							'{{mapDomainLink}}map{{/mapDomainLink}} a domain you already own, ' +
							'or {{redirectLink}}redirect{{/redirectLink}} this site.',
							{
								components: {
									domainSearchLink: (
										<a href={ '/domains/add/' + site.slug } onClick={ this.trackUpgradeClick } />
									),
									mapDomainLink: (
										<a href={ '/domains/add/mapping/' + site.slug } onClick={ this.trackUpgradeClick } />
									),
									redirectLink: (
										<a href={ '/domains/add/site-redirect/' + site.slug } onClick={ this.trackUpgradeClick } />
									)
								}
							}
						)
					}
				</FormSettingExplanation>;
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
						disabled="disabled" />
					{ customAddress }
				</div>
				{ addressDescription }
			</FormFieldset>
		);
	}

	trackUpgradeClick = () => {
		this.props.recordTracksEvent( 'calypso_upgrade_nudge_cta_click', { cta_name: 'settings_site_address' } );
	}

	languageOptions() {
		const { eventTracker, fields, isRequestingSettings, onChangeField, site, translate } = this.props;
		if ( site.jetpack ) {
			return null;
		}
		return (
			<FormFieldset>
				<FormLabel htmlFor="lang_id">{ translate( 'Language' ) }</FormLabel>
				<LanguageSelector
					name="lang_id"
					id="lang_id"
					languages={ config( 'languages' ) }
					value={ fields.lang_id }
					onChange={ onChangeField( 'lang_id' ) }
					disabled={ isRequestingSettings }
					onClick={ eventTracker( 'Clicked Language Field' ) } />
				<FormSettingExplanation>
					{ translate( 'Language this blog is primarily written in.' ) }&nbsp;
					<a href={ config.isEnabled( 'me/account' ) ? '/me/account' : '/settings/account/' }>
						{ translate( 'You can also modify the interface language in your profile.' ) }
					</a>
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	visibilityOptions() {
		const { fields, handleRadio, isRequestingSettings, eventTracker, site, translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel>
					<FormRadio
						name="blog_public"
						value="1"
						checked={ 1 === parseInt( fields.blog_public, 10 ) }
						onChange={ handleRadio }
						disabled={ isRequestingSettings }
						onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) } />
					<span>{ translate( 'Public' ) }</span>
					<FormSettingExplanation isIndented>
						{ translate( 'Your site is visible to everyone, and it may be indexed by search engines.' ) }
					</FormSettingExplanation>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="blog_public"
						value="0"
						checked={ 0 === parseInt( fields.blog_public, 10 ) }
						onChange={ handleRadio }
						disabled={ isRequestingSettings }
						onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) } />
					<span>{ translate( 'Hidden' ) }</span>
					<FormSettingExplanation isIndented>
						{ translate( 'Your site is visible to everyone, but we ask search engines to not index your site.' ) }
					</FormSettingExplanation>
				</FormLabel>

				{ ! site.jetpack &&
					<FormLabel>
						<FormRadio
							name="blog_public"
							value="-1"
							checked={ -1 === parseInt( fields.blog_public, 10 ) }
							onChange={ handleRadio }
							disabled={ isRequestingSettings }
							onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) } />
						<span>{ translate( 'Private' ) }</span>
						<FormSettingExplanation isIndented>
							{ translate( 'Your site is only visible to you and users you approve.' ) }
						</FormSettingExplanation>
					</FormLabel>
				}

			</FormFieldset>
		);
	}

	handleAmpToggle = () => {
		const { fields, submitForm, trackEvent, updateFields } = this.props;
		updateFields( { amp_is_enabled: ! fields.amp_is_enabled }, () => {
			submitForm();
			trackEvent( 'Toggled AMP Toggle' );
		} );
	};

	handleAmpCustomize = () => {
		this.props.trackEvent( 'Clicked AMP Customize button' );
		page( '/customize/amp/' + this.props.site.slug );
	};

	renderAmpSection() {
		if ( this.props.site.jetpack ) {
			return;
		}

		const {
			fields: {
				amp_is_supported: ampIsSupported,
				amp_is_enabled: ampIsEnabled
			},
			isRequestingSettings,
			isSavingSettings,
			translate
		} = this.props;

		const isDisabled = isRequestingSettings || isSavingSettings;
		const isCustomizeDisabled = isDisabled || ! ampIsEnabled;

		if ( ! ampIsSupported ) {
			return null;
		}

		return (
			<div className="site-settings__amp">
				<SectionHeader label={ translate( 'AMP' ) }>
					<Button
						compact
						disabled={ isCustomizeDisabled }
						onClick={ this.handleAmpCustomize }>
						{ translate( 'Edit Design' ) }
					</Button>
					<FormToggle
						checked={ ampIsEnabled }
						onChange={ this.handleAmpToggle }
						disabled={ isDisabled } />
				</SectionHeader>
				<Card className="site-settings__amp-explanation">
					<p>
						{ translate(
							'Your WordPress.com site supports {{a}}Accelerated Mobile Pages (AMP){{/a}}, ' +
							'a new Google-led initiative that dramatically improves loading speeds ' +
							'on phones and tablets. {{a}}Learn More{{/a}}.',
							{
								components: {
									a: <a
										href="https://support.wordpress.com/google-amp-accelerated-mobile-pages/"
										target="_blank" rel="noopener noreferrer" />
								}
							}
						) }
					</p>
				</Card>
			</div>
		);
	}

	relatedPostsOptions() {
		const { fields, handleToggle, isRequestingSettings, translate } = this.props;
		if ( ! fields.jetpack_relatedposts_allowed ) {
			return null;
		}

		return (
			<FormFieldset>
				<ul id="settings-reading-relatedposts">
					<li>
						<FormToggle
							className="is-compact"
							checked={ !! fields.jetpack_relatedposts_enabled }
							disabled={ isRequestingSettings }
							onChange={ handleToggle( 'jetpack_relatedposts_enabled' ) }>
							<span className="site-settings__toggle-label">
								{ translate( 'Show related content after posts' ) }
							</span>
						</FormToggle>
					</li>
					<li>
						<ul id="settings-reading-relatedposts-customize" className="site-settings__child-settings">
							<li>
								<FormToggle
									className="is-compact"
									checked={ !! fields.jetpack_relatedposts_show_headline }
									disabled={ isRequestingSettings || ! fields.jetpack_relatedposts_enabled }
									onChange={ handleToggle( 'jetpack_relatedposts_show_headline' ) }>
									<span className="site-settings__toggle-label">
										{ translate(
											'Show a "Related" header to more clearly separate the related section from posts'
										) }
									</span>
								</FormToggle>
							</li>
							<li>
								<FormToggle
									className="is-compact"
									checked={ !! fields.jetpack_relatedposts_show_thumbnails }
									disabled={ isRequestingSettings || ! fields.jetpack_relatedposts_enabled }
									onChange={ handleToggle( 'jetpack_relatedposts_show_thumbnails' ) }>
									<span className="site-settings__toggle-label">
										{ translate(
											'Use a large and visually striking layout'
										) }
									</span>
								</FormToggle>
							</li>
						</ul>
						<RelatedContentPreview
							showHeadline={ fields.jetpack_relatedposts_show_headline }
							showThumbnails={ fields.jetpack_relatedposts_show_thumbnails }
						/>
					</li>
				</ul>
			</FormFieldset>
		);
	}

	showPublicPostTypesCheckbox() {
		if ( ! config.isEnabled( 'manage/option_sync_non_public_post_stati' ) ) {
			return false;
		}

		const { site } = this.props;
		if ( site.jetpack && site.versionCompare( '4.1.1', '>' ) ) {
			return false;
		}

		return true;
	}

	syncNonPublicPostTypes() {
		const { fields, handleToggle, isRequestingSettings, translate } = this.props;
		if ( ! this.showPublicPostTypesCheckbox() ) {
			return null;
		}

		return (
			<CompactCard>
				<form>
					<ul id="settings-jetpack">
						<li>
							<FormToggle
								className="is-compact"
								checked={ !! fields.jetpack_sync_non_public_post_stati }
								disabled={ isRequestingSettings }
								onChange={ handleToggle( 'jetpack_sync_non_public_post_stati' ) }>
								<span className="site-settings__toggle-label">
									{ translate(
										'Allow synchronization of Posts and Pages with non-public post statuses'
									) }
								</span>
							</FormToggle>
							<FormSettingExplanation>
								{ translate( '(e.g. drafts, scheduled, private, etc\u2026)' ) }
							</FormSettingExplanation>
						</li>
					</ul>
				</form>
			</CompactCard>
		);
	}

	jetpackDisconnectOption() {
		const { site, translate } = this.props;

		if ( ! site.jetpack ) {
			return null;
		}

		const disconnectText = translate( 'Disconnect Site', {
			context: 'Jetpack: Action user takes to disconnect Jetpack site from .com link in general site settings'
		} );

		return <DisconnectJetpackButton
				site={ site }
				text= { disconnectText }
				redirect= "/stats"
				linkDisplay={ false } />;
	}

	holidaySnowOption() {
		// Note that years and months below are zero indexed
		const { fields, handleToggle, isRequestingSettings, moment, site, translate } = this.props,
			today = moment(),
			startDate = moment( { year: today.year(), month: 11, day: 1 } ),
			endDate = moment( { year: today.year(), month: 0, day: 4 } );

		if ( site.jetpack && site.versionCompare( '4.0', '<' ) ) {
			return null;
		}

		if ( today.isBefore( startDate, 'day' ) && today.isAfter( endDate, 'day' ) ) {
			return null;
		}

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Holiday Snow' ) }</FormLegend>
				<ul>
					<li>
						<FormToggle
							className="is-compact"
							checked={ !! fields.holidaysnow }
							disabled={ isRequestingSettings }
							onChange={ handleToggle( 'holidaysnow' ) }>
							<span className="site-settings__toggle-label">
								{ translate(
									'Show falling snow on my blog until January 4th.'
								) }
							</span>
						</FormToggle>
					</li>
				</ul>
			</FormFieldset>
		);
	}

	Timezone() {
		const { fields, isRequestingSettings, site, translate } = this.props;
		if ( site.jetpack ) {
			return;
		}

		return (
			<FormFieldset>
				<FormLabel htmlFor="blogtimezone">
					{ translate( 'Site Timezone' ) }
				</FormLabel>

				<Timezone
					selectedZone={ fields.timezone_string }
					disabled={ isRequestingSettings }
					onSelect={ this.onTimezoneSelect }
				/>

				<FormSettingExplanation>
					{ translate( 'Choose a city in your timezone.' ) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	renderJetpackSyncPanel() {
		const { site } = this.props;
		if ( ! site.jetpack || site.versionCompare( '4.2-alpha', '<' ) ) {
			return null;
		}

		return (
			<JetpackSyncPanel />
		);
	}

	renderApiCache() {
		const { fields, translate, isRequestingSettings, handleToggle } = this.props;

		if ( ! this.showApiCacheCheckbox() ) {
			return null;
		}

		return (
			<CompactCard>
				<FormToggle
					className="is-compact"
					checked={ !! fields.api_cache }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'api_cache' ) }>
					<span className="site-settings__toggle-label">
						{ translate(
							'Use synchronized data to boost performance'
						) }
					</span>
				</FormToggle>
			</CompactCard>
		);
	}

	showApiCacheCheckbox() {
		if ( ! config.isEnabled( 'jetpack/api-cache' ) ) {
			return false;
		}

		const { site } = this.props;
		if ( ! site.jetpack || site.versionCompare( '4.4', '<=' ) ) {
			return false;
		}

		return true;
	}

	render() {
		const { handleSubmitForm, isRequestingSettings, isSavingSettings, site, translate } = this.props;
		if ( site.jetpack && ! site.hasMinimumJetpackVersion ) {
			return this.jetpackDisconnectOption();
		}

		const classes = classNames( 'site-settings__general-settings', {
			'is-loading': isRequestingSettings
		} );

		return (
			<div className={ classNames( classes ) }>
				{ site && <QuerySiteSettings siteId={ site.ID } /> }
				<SectionHeader label={ translate( 'Site Profile' ) }>
					<Button
						compact={ true }
						onClick={ handleSubmitForm }
						primary={ true }
						data-tip-target="settings-site-profile-save"
						type="submit"
						disabled={ isRequestingSettings || isSavingSettings }>
							{ isSavingSettings
								? translate( 'Saving…' )
								: translate( 'Save Settings' )
							}
					</Button>
				</SectionHeader>
				<Card>
					<form>
						{ this.siteOptions() }
						{ this.blogAddress() }
						{ this.languageOptions() }
						{ this.Timezone() }
						{ this.holidaySnowOption() }
					</form>
				</Card>

				<SectionHeader label={ translate( 'Privacy' ) }>
					<Button
						compact={ true }
						onClick={ handleSubmitForm }
						primary={ true }

						type="submit"
						disabled={ isRequestingSettings || isSavingSettings }>
							{ isSavingSettings
								? translate( 'Saving…' )
								: translate( 'Save Settings' )
							}
					</Button>
				</SectionHeader>
				<Card>
					<form>
						{ this.visibilityOptions() }
					</form>
				</Card>

				{ this.renderAmpSection() }

				{
					! site.jetpack && <div className="site-settings__footer-credit-container">
						<SectionHeader label={ translate( 'Footer Credit' ) } />
						<CompactCard className="site-settings__footer-credit-explanation">
							<p>
								{ translate( 'You can customize your website by changing the footer credit in customizer.' ) }
							</p>
							<div>
								<Button className="site-settings__footer-credit-change" href={ '/customize/identity/' + site.slug }>
									{ translate( 'Change footer credit' ) }
								</Button>
							</div>
						</CompactCard>
						{ ! isBusiness( site.plan ) && <UpgradeNudge
							className="site-settings__footer-credit-nudge"
							feature={ FEATURE_NO_BRANDING }
							title={ translate( 'Remove the footer credit entirely with WordPress.com Business' ) }
							message={ translate( 'Upgrade to remove the footer credit, add Google Analytics and more' ) }
							icon="customize"
						/> }
					</div>
				}
				<SectionHeader label={ translate( 'Related Posts' ) }>
					<Button
						compact={ true }
						onClick={ handleSubmitForm }
						primary={ true }

						type="submit"
						disabled={ isRequestingSettings || isSavingSettings }>
							{ isSavingSettings
								? translate( 'Saving…' )
								: translate( 'Save Settings' )
							}
					</Button>
				</SectionHeader>
				<Card>
					<form>
						{ this.relatedPostsOptions() }
					</form>
				</Card>

				{ this.props.site.jetpack
					? <div>
						<SectionHeader label={ translate( 'Jetpack' ) }>
							{ this.jetpackDisconnectOption() }
							{ this.showPublicPostTypesCheckbox() || this.showApiCacheCheckbox()
								? <Button
									compact={ true }
									onClick={ handleSubmitForm }
									primary={ true }
									type="submit"
									disabled={ isRequestingSettings || isSavingSettings }>
									{ isSavingSettings
										? translate( 'Saving…' )
										: translate( 'Save Settings' )
									}
									</Button>
								: null
							}
						</SectionHeader>

						{ this.renderJetpackSyncPanel() }
						{ this.renderApiCache() }
						{ this.syncNonPublicPostTypes() }

						<CompactCard href={ '../security/' + site.slug }>
							{ translate( 'View Jetpack Monitor Settings' ) }
						</CompactCard>
						<CompactCard href={ 'https://wordpress.com/manage/' + site.ID }>
							{ translate( 'Migrate followers from another WordPress.com blog' ) }
						</CompactCard>
					</div>
					: null }
			</div>
		);
	}

	_showWarning( site ) {
		const { translate } = this.props;
		if ( ! site || ! site.options ) {
			return;
		}
		if ( site.jetpack && ! site.hasMinimumJetpackVersion ) {
			notices.warning(
				translate( 'Jetpack %(version)s is required to manage Settings', {
					args: { version: config( 'jetpack_min_version' ) }
				} ),
				{
					button: translate( 'Update now' ),
					href: site.options.admin_url + 'plugins.php?plugin_status=upgrade'
				}
			);
		}
	}
}

export default wrapSettingsForm( settings => {
	const defaultSettings = {
		blogname: '',
		blogdescription: '',
		lang_id: '',
		timezone_string: '',
		blog_public: '',
		admin_url: '',
		jetpack_relatedposts_allowed: false,
		jetpack_relatedposts_enabled: false,
		jetpack_relatedposts_show_headline: false,
		jetpack_relatedposts_show_thumbnails: false,
		jetpack_sync_non_public_post_stati: false,
		holidaysnow: false,
		amp_is_supported: false,
		amp_is_enabled: false,
		api_cache: false,
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
		jetpack_relatedposts_allowed: settings.jetpack_relatedposts_allowed,
		jetpack_sync_non_public_post_stati: settings.jetpack_sync_non_public_post_stati,

		amp_is_supported: settings.amp_is_supported,
		amp_is_enabled: settings.amp_is_enabled,

		holidaysnow: !! settings.holidaysnow,

		api_cache: settings.api_cache,
	};

	if ( settings.jetpack_relatedposts_allowed ) {
		Object.assign( formSettings, {
			jetpack_relatedposts_enabled: ( settings.jetpack_relatedposts_enabled ) ? 1 : 0,
			jetpack_relatedposts_show_headline: settings.jetpack_relatedposts_show_headline,
			jetpack_relatedposts_show_thumbnails: settings.jetpack_relatedposts_show_thumbnails
		} );
	}

	// handling `gmt_offset` and `timezone_string` values
	const gmt_offset = settings.gmt_offset;

	if (
		! settings.timezone_string &&
		typeof gmt_offset === 'string' &&
		gmt_offset.length
	) {
		formSettings.timezone_string = 'UTC' +
			( /\-/.test( gmt_offset ) ? '' : '+' ) +
			gmt_offset;
	}

	return formSettings;
} )( SiteSettingsFormGeneral );
