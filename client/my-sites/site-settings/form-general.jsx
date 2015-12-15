/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	Button = require( 'components/button' ),
	formBase = require( './form-base' ),
	RelatedContentPreview = require( 'my-sites/site-settings/related-content-preview' ),
	LanguageSelector = require( 'components/forms/language-selector' ),
	DisconnectJetpackButton = require( 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-button' ),
	SectionHeader = require( 'components/section-header' ),
	config = require( 'config' ),
	protectForm = require( 'lib/mixins/protect-form' ),
	notices = require( 'notices' ),
	analytics = require( 'analytics' ),
	dirtyLinkedState = require( 'lib/mixins/dirty-linked-state' ),
	Button = require( 'components/button' ),
	Gridicon = require( 'components/gridicon' ),
	FormInput = require( 'components/forms/form-text-input' );

module.exports = React.createClass( {

	displayName: 'SiteSettingsFormGeneral',

	mixins: [ dirtyLinkedState, protectForm.mixin, formBase ],

	getSettingsFromSite: function( site ) {
		var settings;
		site = site || this.props.site;
		settings = {
			blogname: site.name,
			blogdescription: site.description,
			fetchingSettings: site.fetchingSettings
		};

		if ( site.settings ) {
			settings.lang_id = site.settings.lang_id;
			settings.blog_public = site.settings.blog_public;
			settings.admin_url = site.settings.admin_url;
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
		}

		return settings;
	},

	componentWillMount: function() {
		this._showWarning( this.props.site );
	},

	componentWillReceiveProps: function( nextProps ) {
		this._showWarning( nextProps.site );
	},

	resetState: function() {
		this.replaceState( {
			fetchingSettings: true,
			blogname: '',
			blogdescription: '',
			lang_id: '',
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

	siteOptions: function() {
		return (
			<div>
				<fieldset>
					<label htmlFor="blogname">{ this.translate( 'Site Title' ) }</label>
					<FormInput
						name="blogname"
						id="blogname"
						type="text"
						valueLink={ this.linkState( 'blogname' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Site Title Field' ) }
						onKeyPress={ this.recordEventOnce.bind( this, 'typedTitle', 'Typed in Site Title Field' ) }
					/>
				</fieldset>
				<fieldset>
					<label htmlFor="blogdescription">{ this.translate( 'Site Tagline' ) }</label>
					<FormInput
						name="blogdescription"
						type="text"
						id="blogdescription"
						valueLink={ this.linkState( 'blogdescription' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Site Site Tagline Field' ) }
						onKeyPress={ this.recordEventOnce.bind( this, 'typedTagline', 'Typed in Site Site Tagline Field' ) }
					/>
					<p className="settings-explanation">{ this.translate( 'In a few words, explain what this site is about.' ) }</p>
				</fieldset>
			</div>
		);
	},

	blogAddress: function() {
		var site = this.props.site,
			customAddress = '',
			addressDescription = '';

		if ( site.jetpack ) {
			return null;
		}

		if ( config.isEnabled( 'upgrades/domain-search' ) ) {
			customAddress = (
				<Button
					href={ '/domains/add/' + site.slug }
					onClick={ this.trackUpgradeClick }
					
				>
					<Gridicon icon="plus" /> { this.translate( 'Add a Custom Address', { context: 'Site address, domain' } ) }
				</Button>
			);

			addressDescription =
				<p className="settings-explanation">
					{
						this.translate( 'Buy a {{domainSearchLink}}custom domain{{/domainSearchLink}}, {{mapDomainLink}}map{{/mapDomainLink}} a domain you already own, or {{redirectLink}}redirect{{/redirectLink}} this site.', {
							components: {
								domainSearchLink: <a href={ '/domains/add/' + site.slug } onClick={ this.trackUpgradeClick } />,
								mapDomainLink: <a href={ '/domains/add/mapping/' + site.slug } onClick={ this.trackUpgradeClick } />,
								redirectLink: <a href={ '/domains/add/site-redirect/' + site.slug } onClick={ this.trackUpgradeClick } />
							}
						} )
					}
				</p>;
		}

		return (
			<fieldset className="site-settings__blog-address-container">
				<label htmlFor="blogaddress">{ this.translate( 'Site Address' ) }</label>

				<div className="blogaddress-settings">
					<input
						name="blogaddress"
						type="text"
						id="blogaddress"
						value={ this.props.site.domain }
						disabled="disabled"
					/>

					{ customAddress }
				</div>

				{ addressDescription }
			</fieldset>
		);
	},

	trackUpgradeClick: function() {
		analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', { cta_name: 'settings_site_address' } );
	},

	languageOptions: function() {
		if ( this.props.site.jetpack ) {
			return null;
		}
		return (
			<fieldset>
				<label htmlFor="lang_id">{ this.translate( 'Language' ) }</label>
				<LanguageSelector
					name="lang_id"
					id="lang_id"
					languages={ config( 'languages' ) }
					valueLink={ this.linkState( 'lang_id' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Language Field' ) }
				/>
				<p className="settings-explanation">
					{ this.translate( 'Language this blog is primarily written in.' ) }&nbsp;
					<a href={ config.isEnabled( 'me/account' ) ? '/me/account' : '/settings/account/' }>
						{ this.translate( 'You can also modify the interface language in your profile.' ) }
					</a>
				</p>
			</fieldset>
		);
	},

	visibilityOptions: function() {
		var site = this.props.site;

		return (
			<fieldset>
				<label>
					<input
						type="radio"
						name="blog_public"
						value="1"
						checked={ 1 === parseInt( this.state.blog_public, 10 ) }
						onChange={ this.handleRadio }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Site Visibility Radio Button' ) }
					/>
					<span>{ this.translate( 'Allow search engines to index this site' ) }</span>
				</label>

				<label>
					<input
						type="radio"
						name="blog_public"
						value="0"
						checked={ 0 === parseInt( this.state.blog_public, 10 ) }
						onChange={ this.handleRadio }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Site Visibility Radio Button' ) }
					/>
					<span>{ this.translate( 'Discourage search engines from indexing this site' ) }</span>
					<p className="settings-explanation inside-list is-indented">
						{ this.translate( 'Note: This option does not block access to your site — it is up to search engines to honor your request.' ) }
					</p>
				</label>

				{ ! site.jetpack &&
					<label>
						<input
							type="radio"
							name="blog_public"
							value="-1"
							checked={ - 1 === parseInt( this.state.blog_public, 10 ) }
							onChange={ this.handleRadio }
							disabled={ this.state.fetchingSettings }
							onClick={ this.recordEvent.bind( this, 'Clicked Site Visibility Radio Button' ) }
						/>
						<span>{ this.translate( 'I would like my site to be private, visible only to users I choose' ) }</span>
					</label>
				}

			</fieldset>
		);
	},

	relatedPostsOptions: function() {
		if ( ! this.state.jetpack_relatedposts_allowed ) {
			return null;
		}

		return (
			<fieldset>
				<ul id="settings-reading-relatedposts">
					<li>
						<label>
							<input
								type="radio"
								name="jetpack_relatedposts_enabled"
								value="0"
								className="tog"
								checked={ 0 === parseInt( this.state.jetpack_relatedposts_enabled, 10 ) }
								onChange={ this.handleRadio }
								onClick={ this.recordEvent.bind( this, 'Clicked Related Posts Radio Button' ) }
							/>
							<span>{ this.translate( 'Hide related content after posts' ) }</span>
						</label>
					</li>
					<li>
						<label>
							<input
								type="radio"
								name="jetpack_relatedposts_enabled"
								value="1"
								className="tog"
								checked={ 1 === parseInt( this.state.jetpack_relatedposts_enabled, 10 ) }
								onChange={ this.handleRadio }
								onClick={ this.recordEvent.bind( this, 'Clicked Related Posts Radio Button' ) }
							/>
							<span>{ this.translate( 'Show related content after posts' ) }</span>
						</label>
						<ul id="settings-reading-relatedposts-customize" className={ 1 === parseInt( this.state.jetpack_relatedposts_enabled, 10 ) ? null : 'disabled-block' }>
							<li>
								<label>
									<input name="jetpack_relatedposts_show_headline" type="checkbox" checkedLink={ this.linkState( 'jetpack_relatedposts_show_headline' ) }/>
									<span>{ this.translate( 'Show a "Related" header to more clearly separate the related section from posts' ) }</span>
								</label>
							</li>
							<li>
								<label>
									<input name="jetpack_relatedposts_show_thumbnails" type="checkbox" checkedLink={ this.linkState( 'jetpack_relatedposts_show_thumbnails' ) }/>
									<span>{ this.translate( 'Use a large and visually striking layout' ) }</span>
								</label>
							</li>
						</ul>
						<RelatedContentPreview enabled={ 1 === parseInt( this.state.jetpack_relatedposts_enabled, 10 ) } showHeadline={ this.state.jetpack_relatedposts_show_headline } showThumbnails={ this.state.jetpack_relatedposts_show_thumbnails } />
					</li>
				</ul>
			</fieldset>
		);
	},

	syncNonPublicPostTypes: function() {
		if ( ! config.isEnabled( 'manage/option_sync_non_public_post_stati' ) ) {
			return null;
		}
		return (
			<Card className="is-compact">
				<form onChange={ this.markChanged }>
					<ul id="settings-jetpack" className="settings-jetpack">
						<li>
							<label>
								<input name="jetpack_sync_non_public_post_stati" type="checkbox" checkedLink={ this.linkState( 'jetpack_sync_non_public_post_stati' ) }/>
								<span>{ this.translate( 'Allow synchronization of Posts and Pages with non-public post statuses' ) }</span>
								<p className="settings-explanation is-indented">{ this.translate( '(e.g. drafts, scheduled, private, etc\u2026)' ) }</p>
							</label>
						</li>
					</ul>
				</form>
			</Card>
		);
	},

	jetpackDisconnectOption: function() {
		var site = this.props.site,
			disconnectText;

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

	holidaySnowOption: function() {
		// Note that years and months below are zero indexed
		let site = this.props.site,
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
			<fieldset>
				<legend>{ this.translate( 'Holiday Snow' ) }</legend>
				<ul>
					<li>
						<label>
							<input name="holidaysnow" type="checkbox" checkedLink={ this.linkState( 'holidaysnow' ) }/>
							<span>{ this.translate( 'Show falling snow on my blog until January 4th.' ) }</span>
						</label>
					</li>
				</ul>
			</fieldset>
		);
	},

	render: function() {
		var site = this.props.site;
		if ( site.jetpack && ! site.hasMinimumJetpackVersion ) {
			return this.jetpackDisconnectOption();
		}

		return (
			<div>
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
						{ this.holidaySnowOption() }
					</form>
				</Card>
				<SectionHeader label={ this.translate( 'Visibility' ) }>
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
				{ this.props.site.jetpack
					? <div>
						<SectionHeader label={ this.translate( 'Jetpack' ) }>
							{ this.jetpackDisconnectOption() }
							{ config.isEnabled( 'manage/option_sync_non_public_post_stati' )
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

						{ this.syncNonPublicPostTypes() }

						<Card href={ '../security/' + site.slug } className="is-compact">
							{ this.translate( 'View Jetpack Monitor Settings' ) }
						</Card>
						<Card href={ 'https://wordpress.com/manage/' + site.ID } className="is-compact">
							{ this.translate( 'Migrate followers from another WordPress.com blog' ) }
						</Card>
					</div>
					: null }
				<SectionHeader className="after-compact" label={ this.translate( 'Related Posts' ) }>
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
			</div>
		);
	},

	_showWarning: function( site ) {
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
