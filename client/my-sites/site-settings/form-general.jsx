/**
 * External dependencies
 */
import React from 'react';

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
import protectForm from 'lib/mixins/protect-form';
import notices from 'notices';
import analytics from 'lib/analytics';
import dirtyLinkedState from 'lib/mixins/dirty-linked-state';
import Gridicon from 'components/gridicon';
import FormInput from 'components/forms/form-text-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormCheckbox from 'components/forms/form-checkbox';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Timezone from 'components/timezone';
import JetpackSyncPanel from './jetpack-sync-panel';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { isBusiness } from 'lib/products-values';
import { FEATURE_NO_BRANDING } from 'lib/plans/constants';

const FormGeneral = React.createClass( {
	displayName: 'SiteSettingsFormGeneral',

	mixins: [ dirtyLinkedState, protectForm.mixin, formBase ],

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
			holidaysnow: false
		} );
	},

	onTimezoneSelect( timezone ) {
		this.setState( { timezone_string: timezone } );
	},

	onRecordEvent( eventAction ) {
		return this.recordEvent.bind( this, eventAction );
	},

	onRecordEventOnce( key, eventAction ) {
		return this.recordEventOnce.bind( this, key, eventAction );
	},

	siteOptions() {
		return (
			<div>
				<FormFieldset>
					<FormLabel htmlFor="blogname">{ this.translate( 'Site Title' ) }</FormLabel>
					<FormInput
						name="blogname"
						id="blogname"
						type="text"
						valueLink={ this.linkState( 'blogname' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.onRecordEvent( 'Clicked Site Title Field' ) }
						onKeyPress={ this.onRecordEventOnce( 'typedTitle', 'Typed in Site Title Field' ) } />
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="blogdescription">{ this.translate( 'Site Tagline' ) }</FormLabel>
					<FormInput
						name="blogdescription"
						type="text"
						id="blogdescription"
						valueLink={ this.linkState( 'blogdescription' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.onRecordEvent( 'Clicked Site Site Tagline Field' ) }
						onKeyPress={ this.onRecordEventOnce( 'typedTagline', 'Typed in Site Site Tagline Field' ) } />
					<FormSettingExplanation>
						{ this.translate( 'In a few words, explain what this site is about.' ) }
					</FormSettingExplanation>
				</FormFieldset>
			</div>
		);
	},

	blogAddress() {
		const { site } = this.props;
		let customAddress = '',
			addressDescription = '';

		if ( site.jetpack ) {
			return null;
		}

		if ( config.isEnabled( 'upgrades/domain-search' ) ) {
			customAddress = (
				<Button href={ '/domains/add/' + site.slug } onClick={ this.trackUpgradeClick }>
					<Gridicon icon="plus" /> { this.translate( 'Add a Custom Address', { context: 'Site address, domain' } ) }
				</Button>
			);

			addressDescription =
				<FormSettingExplanation>
					{
						this.translate(
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
				<FormLabel htmlFor="blogaddress">{ this.translate( 'Site Address' ) }</FormLabel>
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
		if ( this.props.site.jetpack ) {
			return null;
		}
		return (
			<FormFieldset>
				<FormLabel htmlFor="lang_id">{ this.translate( 'Language' ) }</FormLabel>
				<LanguageSelector
					name="lang_id"
					id="lang_id"
					languages={ config( 'languages' ) }
					valueLink={ this.linkState( 'lang_id' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.onRecordEvent( 'Clicked Language Field' ) } />
				<FormSettingExplanation>
					{ this.translate( 'Language this blog is primarily written in.' ) }&nbsp;
					<a href={ config.isEnabled( 'me/account' ) ? '/me/account' : '/settings/account/' }>
						{ this.translate( 'You can also modify the interface language in your profile.' ) }
					</a>
				</FormSettingExplanation>
			</FormFieldset>
		);
	},

	visibilityOptions() {
		const { site } = this.props;

		return (
			<FormFieldset>
				<FormLabel>
					<FormRadio
						name="blog_public"
						value="1"
						checked={ 1 === parseInt( this.state.blog_public, 10 ) }
						onChange={ this.handleRadio }
						disabled={ this.state.fetchingSettings }
						onClick={ this.onRecordEvent( 'Clicked Site Visibility Radio Button' ) } />
					<span>{ this.translate( 'Public' ) }</span>
					<FormSettingExplanation isIndented>
						{ this.translate( 'Your site is visible to everyone, and it may be indexed by search engines.' ) }
					</FormSettingExplanation>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="blog_public"Ï
						value="0"
						checked={ 0 === parseInt( this.state.blog_public, 10 ) }
						onChange={ this.handleRadio }
						disabled={ this.state.fetchingSettings }
						onClick={ this.onRecordEvent( 'Clicked Site Visibility Radio Button' ) } />
					<span>{ this.translate( 'Hidden' ) }</span>
					<FormSettingExplanation isIndented>
						{ this.translate( 'Your site is visible to everyone, but we ask search engines to not index your site.' ) }
					</FormSettingExplanation>
				</FormLabel>

				{ ! site.jetpack &&
					<FormLabel>
						<FormRadio
							name="blog_public"
							value="-1"
							checked={ -1 === parseInt( this.state.blog_public, 10 ) }
							onChange={ this.handleRadio }
							disabled={ this.state.fetchingSettings }
							onClick={ this.onRecordEvent( 'Clicked Site Visibility Radio Button' ) } />
						<span>{ this.translate( 'Private' ) }</span>
						<FormSettingExplanation isIndented>
							{ this.translate( 'Your site is only visible to you and users you approve.' ) }
						</FormSettingExplanation>
					</FormLabel>
				}

			</FormFieldset>
		);
	},

	relatedPostsOptions() {
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
								onChange={ this.handleRadio }
								onClick={ this.onRecordEvent( 'Clicked Related Posts Radio Button' ) } />
							<span>{ this.translate( 'Hide related content after posts' ) }</span>
						</FormLabel>
					</li>
					<li>
						<FormLabel>
							<FormRadio
								name="jetpack_relatedposts_enabled"
								value="1"
								checked={ 1 === parseInt( this.state.jetpack_relatedposts_enabled, 10 ) }
								onChange={ this.handleRadio }
								onClick={ this.onRecordEvent( 'Clicked Related Posts Radio Button' ) } />
							<span>{ this.translate( 'Show related content after posts' ) }</span>
						</FormLabel>
						<ul
							id="settings-reading-relatedposts-customize"
							className={ 1 === parseInt( this.state.jetpack_relatedposts_enabled, 10 ) ? null : 'disabled-block' }>
							<li>
								<FormLabel>
									<FormCheckbox
										name="jetpack_relatedposts_show_headline"
										checkedLink={ this.linkState( 'jetpack_relatedposts_show_headline' ) }/>
									<span>
										{ this.translate(
											'Show a "Related" header to more clearly separate the related section from posts'
										) }
									</span>
								</FormLabel>
							</li>
							<li>
								<FormLabel>
									<FormCheckbox
										name="jetpack_relatedposts_show_thumbnails"
										checkedLink={ this.linkState( 'jetpack_relatedposts_show_thumbnails' ) }/>
									<span>{ this.translate( 'Use a large and visually striking layout' ) }</span>
								</FormLabel>
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
		if ( ! this.showPublicPostTypesCheckbox() ) {
			return null;
		}

		return (
			<CompactCard>
				<form onChange={ this.markChanged }>
					<ul id="settings-jetpack">
						<li>
							<FormLabel>
								<FormCheckbox
									name="jetpack_sync_non_public_post_stati"
									checkedLink={ this.linkState( 'jetpack_sync_non_public_post_stati' ) }
								/>
								<span>{ this.translate( 'Allow synchronization of Posts and Pages with non-public post statuses' ) }</span>
								<FormSettingExplanation isIndented>
									{ this.translate( '(e.g. drafts, scheduled, private, etc\u2026)' ) }
								</FormSettingExplanation>
							</FormLabel>
						</li>
					</ul>
				</form>
			</CompactCard>
		);
	},

	jetpackDisconnectOption() {
		const { site } = this.props;
		let disconnectText;

		if ( ! site.jetpack ) {
			return null;
		}

		disconnectText = this.translate( 'Disconnect Site', {
			context: 'Jetpack: Action user takes to disconnect Jetpack site from .com link in general site settings'
		} );

		return <DisconnectJetpackButton
				site={ site }
				text= { disconnectText }
				redirect= "/stats"
				linkDisplay={ false } />;
	},

	holidaySnowOption() {
		// Note that years and months below are zero indexed
		const site = this.props.site,
			today = this.moment(),
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
				<legend>{ this.translate( 'Holiday Snow' ) }</legend>
				<ul>
					<li>
						<FormLabel>
							<FormCheckbox name="holidaysnow" checkedLink={ this.linkState( 'holidaysnow' ) }/>
							<span>{ this.translate( 'Show falling snow on my blog until January 4th.' ) }</span>
						</FormLabel>
					</li>
				</ul>
			</FormFieldset>
		);
	},

	Timezone() {
		if ( this.props.site.jetpack ) {
			return;
		}

		return (
			<FormFieldset>
				<FormLabel htmlFor="blogtimezone">
					{ this.translate( 'Site Timezone' ) }
				</FormLabel>

				<Timezone
					valueLink={ this.linkState( 'timezone_string' ) }
					selectedZone={ this.linkState( 'timezone_string' ).value }
					disabled={ this.state.fetchingSettings }
					onSelect={ this.onTimezoneSelect }
				/>

				<FormSettingExplanation>
					{ this.translate( 'Choose a city in your timezone.' ) }
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
		const { site } = this.props;
		if ( site.jetpack && ! site.hasMinimumJetpackVersion ) {
			return this.jetpackDisconnectOption();
		}

		return (
			<div className={ this.state.fetchingSettings ? 'is-loading' : '' }>
				<SectionHeader label={ this.translate( 'Site Profile' ) }>
					<Button
						compact={ true }
						onClick={ this.submitForm }
						primary={ true }

						type="submit"
						disabled={ this.state.fetchingSettings || this.state.submittingForm }>
							{ this.state.submittingForm
								? this.translate( 'Saving…' )
								: this.translate( 'Save Settings' )
							}
					</Button>
				</SectionHeader>
				<Card>
					<form onChange={ this.markChanged }>
						{ this.siteOptions() }
						{ this.blogAddress() }
						{ this.languageOptions() }
						{ this.Timezone() }
						{ this.holidaySnowOption() }
					</form>
				</Card>

				<SectionHeader label={ this.translate( 'Privacy' ) }>
					<Button
						compact={ true }
						onClick={ this.submitForm }
						primary={ true }

						type="submit"
						disabled={ this.state.fetchingSettings || this.state.submittingForm }>
							{ this.state.submittingForm
								? this.translate( 'Saving…' )
								: this.translate( 'Save Settings' )
							}
					</Button>
				</SectionHeader>
				<Card>
					<form onChange={ this.markChanged }>
						{ this.visibilityOptions() }
					</form>
				</Card>
				{
					! this.props.site.jetpack && <div className="site-settings__footer-credit-container">
						<SectionHeader label={ this.translate( 'Footer Credit' ) } />
						<CompactCard className="site-settings__footer-credit-explanation">
							<p>
								{ this.translate( 'You can customize your website by changing the footer credit in customizer.' ) }
							</p>
							<div>
								<Button className="site-settings__footer-credit-change" href={ '/customize/identity/' + site.slug }>
									{ this.translate( 'Change footer credit' ) }
								</Button>
							</div>
						</CompactCard>
						{ ! isBusiness( site.plan ) && <UpgradeNudge
							className="site-settings__footer-credit-nudge"
							feature={ FEATURE_NO_BRANDING }
							title={ this.translate( 'Remove the footer credit entirely with Business Plan' ) }
							message={ this.translate( 'Upgrade to remove the footer credit, add Google Analytics and more' ) }
							icon="customize"
						/> }
					</div>
				}
				<SectionHeader label={ this.translate( 'Related Posts' ) }>
					<Button
						compact={ true }
						onClick={ this.submitForm }
						primary={ true }

						type="submit"
						disabled={ this.state.fetchingSettings || this.state.submittingForm }>
							{ this.state.submittingForm
								? this.translate( 'Saving…' )
								: this.translate( 'Save Settings' )
							}
					</Button>
				</SectionHeader>
				<Card>
					<form onChange={ this.markChanged }>
						{ this.relatedPostsOptions() }
					</form>
				</Card>

				{ this.props.site.jetpack
					? <div>
						<SectionHeader label={ this.translate( 'Jetpack' ) }>
							{ this.jetpackDisconnectOption() }
							{ this.showPublicPostTypesCheckbox()
								? <Button
									compact={ true }
									onClick={ this.submitForm }
									primary={ true }
									type="submit"
									disabled={ this.state.fetchingSettings || this.state.submittingForm }>
									{ this.state.submittingForm
										? this.translate( 'Saving…' )
										: this.translate( 'Save Settings' )
									}
									</Button>
								: null
							}
						</SectionHeader>

						{ this.renderJetpackSyncPanel() }
						{ this.syncNonPublicPostTypes() }

						<CompactCard href={ '../security/' + site.slug }>
							{ this.translate( 'View Jetpack Monitor Settings' ) }
						</CompactCard>
						<CompactCard href={ 'https://wordpress.com/manage/' + site.ID }>
							{ this.translate( 'Migrate followers from another WordPress.com blog' ) }
						</CompactCard>
					</div>
					: null }
			</div>
		);
	},

	_showWarning( site ) {
		if ( ! site || ! site.options ) {
			return;
		}
		if ( site.jetpack && ! site.hasMinimumJetpackVersion ) {
			notices.warning(
				this.translate( 'Jetpack %(version)s is required to manage Settings', {
					args: { version: config( 'jetpack_min_version' ) }
				} ),
				{
					button: this.translate( 'Update now' ),
					href: site.options.admin_url + 'plugins.php?plugin_status=upgrade'
				}
			);
		}
	}
} );

export default FormGeneral;
