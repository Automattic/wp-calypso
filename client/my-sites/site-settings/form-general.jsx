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
	analytics = require( 'analytics' );

module.exports = React.createClass( {

	displayName: 'SiteSettingsFormGeneral',

	mixins: [ React.addons.LinkedStateMixin, protectForm.mixin, formBase ],

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
			jetpack_sync_non_public_post_stati: false
		} );
	},

	siteOptions: function() {
		return (
			<fieldset>
				<label htmlFor="blogname">{ this.translate( 'Site Title' ) }</label>
				<input
					name="blogname"
					id="blogname"
					type="text"
					valueLink={ this.linkState( 'blogname' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Site Title Field' ) }
					onKeyPress={ this.recordEventOnce.bind( this, 'typedTitle', 'Typed in Site Title Field' ) }
				/>
				<p className="settings-explanation">{ this.translate( 'In a few words, explain what this site is about.' ) }</p>

				<label htmlFor="blogdescription">{ this.translate( 'Site Tagline' ) }</label>
				<input
					name="blogdescription"
					type="text"
					id="blogdescription"
					valueLink={ this.linkState( 'blogdescription' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Site Site Tagline Field' ) }
					onKeyPress={ this.recordEventOnce.bind( this, 'typedTagline', 'Typed in Site Site Tagline Field' ) }
				/>
			</fieldset>
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
			customAddress = <a
								href={ '/domains/add/' + site.slug  }
								className="button"
								onClick={ this.trackUpgradeClick }>{ this.translate( 'Add a custom address', { context: 'Site address, domain' } ) }
							</a>;

			addressDescription =
				<p className="settings-explanation">
					{
						this.translate( 'Buy a {{domainSearchLink}}custom domain{{/domainSearchLink}}, {{mapDomainLink}}map{{/mapDomainLink}} a domain you already own, or {{redirectLink}}redirect{{/redirectLink}} this site.', {
							components: {
								domainSearchLink: <a href={ '/domains/add/' + site.slug  } onClick={ this.trackUpgradeClick } />,
								mapDomainLink: <a href={ '/domains/add/mapping/' + site.slug  } onClick={ this.trackUpgradeClick } />,
								redirectLink: <a href={ '/domains/add/site-redirect/' + site.slug  } onClick={ this.trackUpgradeClick } />
							}
						} )
					}
				</p>;
		}

		return (
			<fieldset>
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
		var site = this.props.site,
			privateSiteOption;

		if ( ! this.props.site.jetpack ) {
			privateSiteOption =
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
				</label>;
		}

		return (
			<fieldset>

				<legend>{ this.translate( 'Site Visibility' ) }</legend>

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
					<p className="settings-explanation inside-list">
						{ this.translate( 'Note: This option does not block access to your site — it is up to search engines to honor your request.' ) }
					</p>
				</label>

				{ ! site.jetpack ?
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
				: null }

			</fieldset>
		);
	},

	relatedPostsOptions: function() {

		if ( ! this.state.jetpack_relatedposts_allowed ) {
			return null;
		}

		return (
			<fieldset>
				<legend>{ this.translate( 'Related Posts' ) }</legend>
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
			<ul id="settings-jetpack" className="settings-jetpack">
				<li>
					<label>
						<input name="jetpack_sync_non_public_post_stati" type="checkbox" checkedLink={ this.linkState( 'jetpack_sync_non_public_post_stati' ) }/>
						<span>{ this.translate( 'Allow synchronization of Posts and Pages with non-public post statuses' ) }</span>
						<p className="settings-explanation">{ this.translate( '(e.g. drafts, scheduled, private, etc\u2026)' ) }</p>
					</label>
				</li>
			</ul>
		);
	},

	jetpackOptions: function() {
		var site = this.props.site;

		if ( ! site.jetpack ) {
			return null;
		}

		return (
			<fieldset>
				<legend>{ this.translate( 'Jetpack Status' ) }</legend>
				{ this.syncNonPublicPostTypes() }
				<p>{
					this.translate( 'You can also {{manageLink}}manage the monitor settings{{/manageLink}} and {{migrateLink}}migrate followers{{/migrateLink}}.', {
						components: {
							manageLink: <a href={ '../security/' + site.slug  } />,
							migrateLink: <a href={ 'https://wordpress.com/manage/' + site.ID } />
						}
					} )
				}</p>
			</fieldset>
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

		return (
			<fieldset>
				<legend>{ this.translate( 'Jetpack Connection' ) }</legend>
				<ul id="settings-jetpack-connection" className="settings-jetpack">
					<li>
						<label>
							<DisconnectJetpackButton
								site={ site }
								text= { disconnectText }
								redirect= "/stats"
								linkDisplay={ false }
							/>
							<p className="settings-explanation inside-list">
								{ this.translate( 'This action cannot be undone. You will need to reconnect manually from your site dashboard.' ) }
							</p>
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
						{ this.languageOptions() }
					</form>
				</Card>
				<SectionHeader label={ this.translate( 'Address and visibility' ) }>
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
						{ this.blogAddress() }
						{ this.visibilityOptions() }
					</form>
				</Card>
				<SectionHeader label={ this.translate( 'Other' ) }>
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
						{ this.jetpackOptions() }
						{ this.jetpackDisconnectOption() }
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
