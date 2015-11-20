/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var HeaderCake = require( 'components/header-cake' ),
	SimpleNotice = require( 'notices/simple-notice' ),
	ActionPanel = require( 'my-sites/site-settings/action-panel' ),
	ActionPanelTitle = require( 'my-sites/site-settings/action-panel/title' ),
	ActionPanelBody = require( 'my-sites/site-settings/action-panel/body' ),
	ActionPanelFigure = require( 'my-sites/site-settings/action-panel/figure' ),
	ActionPanelFooter = require( 'my-sites/site-settings/action-panel/footer' ),
	Dialog = require( 'components/dialog' ),
	config = require( 'config' ),
	SiteListActions = require( 'lib/sites-list/actions' );

module.exports = React.createClass( {

	displayName: 'DeleteSite',

	mixins: [ React.addons.LinkedStateMixin ],

	getInitialState: function() {
		return {
			showDialog: false,
			confirmDomain: '',
			site: this.props.sites.getSelectedSite()
		};
	},

	componentWillMount: function() {
		debug( 'Mounting DeleteSite React component.' );
		this.props.sites.on( 'change', this._updateSite );
	},

	componentWillUnmount: function() {
		this.props.sites.off( 'change', this._updateSite );
	},

	render: function() {
		var site = this.state.site,
			adminURL = site.options && site.options.admin_url ? site.options.admin_url : '',
			exportLink = config.isEnabled( 'manage/export' ) ? '/settings/export/' + site.slug : adminURL + 'export.php',
			exportTarget = config.isEnabled( 'manage/export' ) ? undefined : '_blank',
			deleteDisabled = ( typeof this.state.confirmDomain !== 'string' || this.state.confirmDomain.replace( /\s/g, '' ) !== site.domain ),
			deleteButtons, strings;

		deleteButtons = [
			<button
				className="button"
				onClick={ this._closeDialog }>{
					this.translate( 'Cancel' )
			}</button>,
			<button
				className="button is-destructive"
				disabled={ deleteDisabled }
				onClick={ this._deleteSite }>{
					this.translate( 'Delete this Site' )
			}</button>
		];

		strings = {
			deleteSite: this.translate( 'Delete Site' ),
			confirmDeleteSite: this.translate( 'Confirm Delete Site' ),
			exportContentFirst: this.translate( 'Export Content First' ),
			exportContent: this.translate( 'Export Content' ),
			contactSupport: this.translate( 'Contact Support' )
		};

		return (
			<div className="main main-column" role="main">
				<HeaderCake onClick={ this._goBack }><h1>{ strings.deleteSite }</h1></HeaderCake>
				<ActionPanel>
					<ActionPanelBody>
						<ActionPanelFigure><img src="/calypso/images/delete-site/export-content.png" /></ActionPanelFigure>
						<ActionPanelTitle>{ strings.exportContentFirst }</ActionPanelTitle>
						<p>{
							this.translate( 'Before deleting your site, please take the time to export your content now. ' +
								'All your posts, pages, and settings will be packaged into a .zip file that you can use in ' +
								'the future to resume where you left off.' )
						}
						</p>
						<p>{
							this.translate( 'Keep in mind that this content {{strong}}can not{{/strong}} be recovered in the future.', {
								components: {
									strong: <strong />
								}
							} )
						}</p>
					</ActionPanelBody>
					<ActionPanelFooter>
						<a
							className="button"
							disabled={ ! this.state.site }
							onClick={ this._checkSiteLoaded }
							href={ exportLink }
							target={ exportTarget }>
							{ strings.exportContent }
							<span className="noticon noticon-external settings-action-panel__footer-button-icon"></span>
						</a>
					</ActionPanelFooter>
				</ActionPanel>
				<ActionPanel>
					<ActionPanelTitle>{ strings.deleteSite }</ActionPanelTitle>
					<ActionPanelBody>
						<SimpleNotice status="is-warning" showDismiss={ false }>
							{ this.translate( '{{strong}}%(domain)s{{/strong}} will be unavailable in the future.', {
								components: {
									strong: <strong />
								},
								args: {
									domain: site.domain
								}
							} ) }
						</SimpleNotice>
						<ActionPanelFigure>
							<h3 className="delete-site__content-list-header">{ this.translate( 'These items will be deleted' ) }</h3>
							<ul className="delete-site__content-list">
								<li className="delete-site__content-list-item">{ this.translate( 'Posts' ) }</li>
								<li className="delete-site__content-list-item">{ this.translate( 'Pages' ) }</li>
								<li className="delete-site__content-list-item">{ this.translate( 'Media' ) }</li>
								<li className="delete-site__content-list-item">{ this.translate( 'Users & Authors' ) }</li>
								<li className="delete-site__content-list-item">{ this.translate( 'Domains' ) }</li>
								<li className="delete-site__content-list-item">{ this.translate( 'Purchased Upgrades' ) }</li>
							</ul>
						</ActionPanelFigure>
						<p>{
							this.translate( 'This action {{strong}}can not{{/strong}} be undone. Deleting the site will remove all content, ' +
								'contributors, domains, and upgrades from the site.', {
									components: {
										strong: <strong />
									}
								} )
						}</p>
						<p>{
							this.translate( 'If you\'re unsure about what will be deleted or need any help, not to worry, our support team ' +
								'is here to answer any questions you might have.' )
						}</p>
						<p><a className="settings-action-panel__body-text-link" href="https://en.support.wordpress.com/contact" target="_blank">{ strings.contactSupport }</a></p>
					</ActionPanelBody>
					<ActionPanelFooter>
						<button
							className="button is-dangerous"
							disabled={ ! this.state.site }
							onClick={ this._showDialog }>
							<span className="noticon noticon-trash settings-action-panel__footer-button-icon"></span>
							{ strings.deleteSite }
						</button>
					</ActionPanelFooter>

					<Dialog isVisible={ this.state.showDialog } buttons={ deleteButtons } className="delete-site__confirm-dialog">
						<h1 className="delete-site__confirm-header">{ strings.confirmDeleteSite }</h1>
						<p className="delete-site__confirm-paragraph">{
							this.translate( 'Please type in {{warn}}%(siteAddress)s{{/warn}} in the field below to confirm. Your site will then be gone forever.', {
								components: {
									warn: <span className="delete-site__target-domain"/>
								},
								args: {
									siteAddress: site.domain
								}
							} )
						}</p>
					<input className="delete-site__confirm-input" type="text" valueLink={ this.linkState( 'confirmDomain' ) }/>
					</Dialog>
				</ActionPanel>
			</div>
		);
	},

	_showDialog: function() {
		this.setState( { showDialog: true } );
	},

	_closeDialog: function() {
		this.setState( { showDialog: false } );
	},

	_goBack: function() {
		var site = this.state.site;
		page( '/settings/general/' + site.slug );
	},

	_deleteSite: function() {
		var site = this.state.site;
		SiteListActions.deleteSite( site );
		window.scrollTo( 0, 0 );
		page( '/stats' );
	},

	_updateSite: function() {
		this.setState( {
			site: this.props.sites.getSelectedSite()
		} );
	},

	_checkSiteLoaded: function( event ) {
		if ( ! this.state.site ) {
			event.preventDefault();
		}
	}

} );
