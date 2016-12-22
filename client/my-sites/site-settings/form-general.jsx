/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import formBase from './form-base';
import RelatedContentPreview from 'my-sites/site-settings/related-content-preview';
import LanguageSelector from 'components/forms/language-selector';
import DisconnectJetpackButton from 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-button';
import SectionHeader from 'components/section-header';
import config from 'config';
import { protectForm } from 'lib/protect-form';
import notices from 'notices';
import analytics from 'lib/analytics';
import Gridicon from 'components/gridicon';
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

const SiteSettingsFormGeneral = React.createClass( {
	mixins: [ formBase ],

	getSettingsFromSite( site ) {
		site = site || this.props.site;

		const settings = {
			blogname: site.name,
			blogdescription: site.description,
			fetchingSettings: site.fetchingSettings
		};

		if ( site.settings ) {
			settings.lang_id = site.settings.lang_id;
			settings.blog_public = site.settings.blog_public;
			settings.admin_url = site.settings.admin_url;
			settings.timezone_string = site.settings.timezone_string;
			settings.jetpack_relatedposts_allowed = site.settings.jetpack_relatedposts_allowed;
			settings.jetpack_sync_non_public_post_stati = site.settings.jetpack_sync_non_public_post_stati;

			settings.amp_is_supported = site.settings.amp_is_supported;
			settings.amp_is_enabled = site.settings.amp_is_enabled;

			if ( settings.jetpack_relatedposts_allowed ) {
				settings.jetpack_relatedposts_enabled = ( site.settings.jetpack_relatedposts_enabled ) ? 1 : 0;
				settings.jetpack_relatedposts_show_headline = site.settings.jetpack_relatedposts_show_headline;
				settings.jetpack_relatedposts_show_thumbnails = site.settings.jetpack_relatedposts_show_thumbnails;
			}

			if ( site.settings.holidaysnow ) {
				settings.holidaysnow = site.settings.holidaysnow;
			}

			// handling `gmt_offset` and `timezone_string` values
			const gmt_offset = site.settings.gmt_offset;

			if (
				! settings.timezone_string &&
				typeof gmt_offset === 'string' &&
				gmt_offset.length
			) {
				settings.timezone_string = 'UTC' +
					( /\-/.test( gmt_offset ) ? '' : '+' ) +
					gmt_offset;
			}
		}

		return settings;
	},

	componentWillMount() {
		this._showWarning( this.props.site );
	},

	componentWillReceiveProps( nextProps ) {
		this._showWarning( nextProps.site );
	},

	resetState() {
		this.replaceState( {
			fetchingSettings: true,
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
		} );
	},

	onRecordEvent( eventAction ) {
		return this.recordEvent.bind( this, eventAction );
	},

	onRecordEventOnce( key, eventAction ) {
		return this.recordEventOnce.bind( this, key, eventAction );
	},

	setDirtyField( key ) {
		const newState = {};
		const dirtyFields = this.state.dirtyFields || [];
		if ( dirtyFields.indexOf( key ) === -1 ) {
			newState.dirtyFields = [ ...dirtyFields, key ];
		}
		this.setState( newState );
	},

	handleChange( event ) {
		const currentTargetName = event.currentTarget.name,
			currentTargetValue = event.currentTarget.value;

		this.setDirtyField( currentTargetName );
		this.setState( { [ currentTargetName ]: currentTargetValue } );
	},

	handleToggle( name ) {
		return () => {
			this.recordEvent( this, `Toggled ${ name }` );
			this.setDirtyField( name );
			this.setState( { [ name ]: ! this.state[ name ] } );
		};
	},

	handleTimezoneSelect( timezone ) {
		this.setDirtyField( 'timezone_string' );
		this.setState( { timezone_string: timezone } );
	},

	siteOptions() {
		const { translate } = this.props;
		return (
			<div className="site-settings__site-options">
				<div className="site-settings__site-title-tagline">
					<FormFieldset>
						<FormLabel htmlFor="blogname">{ translate( 'Site Title' ) }</FormLabel>
						<FormInput
							name="blogname"
							id="blogname"
							type="text"
							value={ this.state.blogname }
							disabled={ this.state.fetchingSettings }
							onChange={ this.handleChange }
							onClick={ this.onRecordEvent( 'Clicked Site Title Field' ) }
							onKeyPress={ this.onRecordEventOnce( 'typedTitle', 'Typed in Site Title Field' ) }
							data-tip-target="site-title-input" />
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="blogdescription">{ translate( 'Site Tagline' ) }</FormLabel>
						<FormInput
							name="blogdescription"
							type="text"
							id="blogdescription"
							value={ this.state.blogdescription }
							disabled={ this.state.fetchingSettings }
							onChange={ this.handleChange }
							onClick={ this.onRecordEvent( 'Clicked Site Site Tagline Field' ) }
							onKeyPress={ this.onRecordEventOnce( 'typedTagline', 'Typed in Site Site Tagline Field' ) }
							data-tip-target="site-tagline-input" />
						<FormSettingExplanation>
							{ translate( 'In a few words, explain what this site is about.' ) }
						</FormSettingExplanation>
					</FormFieldset>
				</div>
				<SiteIconSetting />
			</div>
		);
	},

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
						value={ this.props.site.domain }
						disabled="disabled" />
					{ customAddress }
				</div>
				{ addressDescription }
			</FormFieldset>
		);
	},

	trackUpgradeClick() {
		analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', { cta_name: 'settings_site_address' } );
	},

	languageOptions() {
		const { translate } = this.props;

		if ( this.props.site.jetpack ) {
			return null;
		}

		return (
			<FormFieldset>
				<FormLabel htmlFor="lang_id">{ translate( 'Language' ) }</FormLabel>
				<LanguageSelector
					name="lang_id"
					id="lang_id"
					languages={ config( 'languages' ) }
					value={ this.state.lang_id }
					onChange={ this.handleChange }
					disabled={ this.state.fetchingSettings }
					onClick={ this.onRecordEvent( 'Clicked Language Field' ) } />
				<FormSettingExplanation>
					{ translate( 'Language this blog is primarily written in.' ) }&nbsp;
					<a href={ config.isEnabled( 'me/account' ) ? '/me/account' : '/settings/account/' }>
						{ translate( 'You can also modify the interface language in your profile.' ) }
					</a>
				</FormSettingExplanation>
			</FormFieldset>
		);
	},

	visibilityOptions() {
		const { site, translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel>
					<FormRadio
						name="blog_public"
						value="1"
						checked={ 1 === parseInt( this.state.blog_public, 10 ) }
						onChange={ this.handleChange }
						disabled={ this.state.fetchingSettings }
						onClick={ this.onRecordEvent( 'Clicked Site Visibility Radio Button' ) } />
					<span>{ translate( 'Public' ) }</span>
					<FormSettingExplanation isIndented>
						{ translate( 'Your site is visible to everyone, and it may be indexed by search engines.' ) }
					</FormSettingExplanation>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="blog_public"
						value="0"
						checked={ 0 === parseInt( this.state.blog_public, 10 ) }
						onChange={ this.handleChange }
						disabled={ this.state.fetchingSettings }
						onClick={ this.onRecordEvent( 'Clicked Site Visibility Radio Button' ) } />
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
							checked={ -1 === parseInt( this.state.blog_public, 10 ) }
							onChange={ this.handleChange }
							disabled={ this.state.fetchingSettings }
							onClick={ this.onRecordEvent( 'Clicked Site Visibility Radio Button' ) } />
						<span>{ translate( 'Private' ) }</span>
						<FormSettingExplanation isIndented>
							{ translate( 'Your site is only visible to you and users you approve.' ) }
						</FormSettingExplanation>
					</FormLabel>
				}

			</FormFieldset>
		);
	},

	handleAmpToggle() {
		this.setState( { amp_is_enabled: ! this.state.amp_is_enabled }, () => {
			this.submitForm();
			this.onRecordEvent( 'Clicked AMP Toggle' );
		} );
	},

	handleAmpCustomize() {
		this.onRecordEvent( 'Clicked AMP Customize button' );
		page( '/customize/amp/' + this.props.site.slug );
	},

	renderAmpSection() {
		const { site, translate } = this.props;

		if ( site.jetpack ) {
			return;
		}

		const {
			fetchingSettings,
			submittingForm,
			amp_is_supported,
			amp_is_enabled,
		} = this.state;

		const isDisabled = fetchingSettings || submittingForm;
		const isCustomizeDisabled = isDisabled || ! amp_is_enabled;

		if ( ! amp_is_supported ) {
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
						checked={ amp_is_enabled }
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
	},

	relatedPostsOptions() {
		const { translate } = this.props;

		if ( ! this.state.jetpack_relatedposts_allowed ) {
			return null;
		}

		return (
			<FormFieldset>
				<ul id="settings-reading-relatedposts">
					<li>
						<FormLabel>
							<FormRadio
								name="jetpack_relatedposts_enabled"
								value="0"
								checked={ 0 === parseInt( this.state.jetpack_relatedposts_enabled, 10 ) }
								onChange={ this.handleChange }
								onClick={ this.onRecordEvent( 'Clicked Related Posts Radio Button' ) } />
							<span>{ translate( 'Hide related content after posts' ) }</span>
						</FormLabel>
					</li>
					<li>
						<FormLabel>
							<FormRadio
								name="jetpack_relatedposts_enabled"
								value="1"
								checked={ 1 === parseInt( this.state.jetpack_relatedposts_enabled, 10 ) }
								onChange={ this.handleChange }
								onClick={ this.onRecordEvent( 'Clicked Related Posts Radio Button' ) } />
							<span>{ translate( 'Show related content after posts' ) }</span>
						</FormLabel>
						<ul
							id="settings-reading-relatedposts-customize"
							className={ 1 === parseInt( this.state.jetpack_relatedposts_enabled, 10 ) ? null : 'disabled-block' }>
							<li>
								<FormToggle
									className="is-compact"
									checked={ !! this.state.jetpack_relatedposts_show_headline }
									disabled={ this.state.fetchingSettings }
									onChange={ this.handleToggle( 'jetpack_relatedposts_show_headline' ) }>
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
									checked={ !! this.state.jetpack_relatedposts_show_thumbnails }
									disabled={ this.state.fetchingSettings }
									onChange={ this.handleToggle( 'jetpack_relatedposts_show_thumbnails' ) }>
									<span className="site-settings__toggle-label">
										{ translate(
											'Use a large and visually striking layout'
										) }
									</span>
								</FormToggle>
							</li>
						</ul>
						<RelatedContentPreview
							enabled={ 1 === parseInt( this.state.jetpack_relatedposts_enabled, 10 ) }
							showHeadline={ this.state.jetpack_relatedposts_show_headline }
							showThumbnails={ this.state.jetpack_relatedposts_show_thumbnails } />
					</li>
				</ul>
			</FormFieldset>
		);
	},

	showPublicPostTypesCheckbox() {
		if ( ! config.isEnabled( 'manage/option_sync_non_public_post_stati' ) ) {
			return false;
		}

		const { site } = this.props;
		if ( site.jetpack && site.versionCompare( '4.1.1', '>' ) ) {
			return false;
		}

		return true;
	},

	syncNonPublicPostTypes() {
		const { translate } = this.props;

		if ( ! this.showPublicPostTypesCheckbox() ) {
			return null;
		}

		return (
			<CompactCard className="site-settings__general-settings">
				<form onChange={ this.props.markChanged }>
					<ul id="settings-jetpack">
						<li>
							<FormLabel>
								<FormToggle
									className="is-compact"
									checked={ !! this.state.jetpack_sync_non_public_post_stati }
									disabled={ this.state.fetchingSettings }
									onChange={ this.handleToggle( 'jetpack_sync_non_public_post_stati' ) }>
									<span className="site-settings__toggle-label">
										{ translate(
											'Allow synchronization of Posts and Pages with non-public post statuses'
										) }
									</span>
								</FormToggle>
								<FormSettingExplanation>
									{ translate( '(e.g. drafts, scheduled, private, etc\u2026)' ) }
								</FormSettingExplanation>
							</FormLabel>
						</li>
					</ul>
				</form>
			</CompactCard>
		);
	},

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
	},

	holidaySnowOption() {
		const { site, translate } = this.props;
		// Note that years and months below are zero indexed
		const today = this.moment(),
			startDate = this.moment( { year: today.year(), month: 11, day: 1 } ),
			endDate = this.moment( { year: today.year(), month: 0, day: 4 } );

		if ( site.jetpack && site.versionCompare( '4.0', '<' ) ) {
			return null;
		}

		if ( today.isBefore( startDate, 'day' ) && today.isAfter( endDate, 'day' ) ) {
			return null;
		}

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Holiday Snow' ) }</FormLegend>
				<FormToggle
					className="is-compact"
					checked={ !! this.state.holidaysnow }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'holidaysnow' ) }>
					<span className="site-settings__toggle-label">
						{ translate(
							'Show falling snow on my blog until January 4th.'
						) }
					</span>
				</FormToggle>
			</FormFieldset>
		);
	},

	Timezone() {
		const { translate } = this.props;

		if ( this.props.site.jetpack ) {
			return;
		}

		return (
			<FormFieldset>
				<FormLabel htmlFor="blogtimezone">
					{ translate( 'Site Timezone' ) }
				</FormLabel>

				<Timezone
					selectedZone={ this.state.timezone_string }
					disabled={ this.state.fetchingSettings }
					onSelect={ this.handleTimezoneSelect }
				/>

				<FormSettingExplanation>
					{ translate( 'Choose a city in your timezone.' ) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	},

	renderJetpackSyncPanel() {
		if ( ! config.isEnabled( 'jetpack/sync-panel' ) ) {
			return null;
		}

		const { site } = this.props;
		if ( ! site.jetpack || this.props.site.versionCompare( '4.2-alpha', '<' ) ) {
			return null;
		}

		return (
			<JetpackSyncPanel />
		);
	},

	render() {
		const { site, translate } = this.props;
		if ( site.jetpack && ! site.hasMinimumJetpackVersion ) {
			return this.jetpackDisconnectOption();
		}

		return (
			<div className={ this.state.fetchingSettings ? 'is-loading' : '' }>
				<SectionHeader label={ translate( 'Site Profile' ) }>
					<Button
						compact={ true }
						onClick={ this.handleSubmitForm }
						primary={ true }
						data-tip-target="settings-site-profile-save"
						type="submit"
						disabled={ this.state.fetchingSettings || this.state.submittingForm }>
							{ this.state.submittingForm
								? translate( 'Saving…' )
								: translate( 'Save Settings' )
							}
					</Button>
				</SectionHeader>
				<Card className="site-settings__general-settings">
					<form onChange={ this.props.markChanged }>
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
						onClick={ this.handleSubmitForm }
						primary={ true }

						type="submit"
						disabled={ this.state.fetchingSettings || this.state.submittingForm }>
							{ this.state.submittingForm
								? translate( 'Saving…' )
								: translate( 'Save Settings' )
							}
					</Button>
				</SectionHeader>
				<Card className="site-settings__general-settings">
					<form onChange={ this.props.markChanged }>
						{ this.visibilityOptions() }
					</form>
				</Card>

				{ this.renderAmpSection() }

				{
					! this.props.site.jetpack && <div className="site-settings__footer-credit-container">
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
						onClick={ this.handleSubmitForm }
						primary={ true }

						type="submit"
						disabled={ this.state.fetchingSettings || this.state.submittingForm }>
							{ this.state.submittingForm
								? translate( 'Saving…' )
								: translate( 'Save Settings' )
							}
					</Button>
				</SectionHeader>
				<Card className="site-settings__general-settings">
					<form onChange={ this.props.markChanged }>
						{ this.relatedPostsOptions() }
					</form>
				</Card>

				{ this.props.site.jetpack
					? <div>
						<SectionHeader label={ translate( 'Jetpack' ) }>
							{ this.jetpackDisconnectOption() }
							{ this.showPublicPostTypesCheckbox()
								? <Button
									compact={ true }
									onClick={ this.handleSubmitForm }
									primary={ true }
									type="submit"
									disabled={ this.state.fetchingSettings || this.state.submittingForm }>
									{ this.state.submittingForm
										? translate( 'Saving…' )
										: translate( 'Save Settings' )
									}
									</Button>
								: null
							}
						</SectionHeader>

						{ this.renderJetpackSyncPanel() }
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
	},

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
} );

export default protectForm( localize( SiteSettingsFormGeneral ) );
