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
	ActionPanel = require( 'my-sites/site-settings/action-panel' ),
	ActionPanelTitle = require( 'my-sites/site-settings/action-panel/title' ),
	ActionPanelBody = require( 'my-sites/site-settings/action-panel/body' ),
	ActionPanelFigure = require( 'my-sites/site-settings/action-panel/figure' ),
	ActionPanelFooter = require( 'my-sites/site-settings/action-panel/footer' );

module.exports = React.createClass( {

	displayName: 'StartOver',

	getInitialState: function() {
		return {
			site: this.props.sites.getSelectedSite()
		};
	},

	componentWillMount: function() {
		debug( 'Mounting StartOverPage React component.' );
		this.props.sites.on( 'change', this._updateSite );
	},

	componentWillUnmount: function() {
		this.props.sites.off( 'change', this._updateSite );
	},

	render: function() {
		var strings = {
			startOver: this.translate( 'Start Over' ),
			contactSupport: this.translate( 'Contact Support' )
		};

		return (
			<div className="main main-column" role="main">
				<HeaderCake onClick={ this._goBack }><h1>{ strings.startOver }</h1></HeaderCake>
				<ActionPanel>
					<ActionPanelBody>
						<ActionPanelFigure inlineBodyText={ true }><img src="/calypso/images/delete-site/start-over.png" /></ActionPanelFigure>
						<ActionPanelTitle>{ strings.startOver }</ActionPanelTitle>
						<p>{
							this.translate( 'If you want a site but don\'t want any of the posts and pages you have now, our support ' +
								'team can delete your posts, pages, media, and comments for you.' )
						}</p>
						<p>{
							this.translate( 'This will keep your site and URL active, but give you a fresh start on your content ' +
								'creation. Just contact us to have your current content cleared out.' )
						}</p>
					</ActionPanelBody>
					<ActionPanelFooter>
						<a className="button" href="https://en.support.wordpress.com/contact" target="_blank">{ strings.contactSupport }<span className="noticon noticon-external settings-action-panel__footer-button-icon"></span></a>
					</ActionPanelFooter>
				</ActionPanel>
			</div>
		);
	},

	_updateSite: function() {
		this.setState( {
			site: this.props.sites.getSelectedSite()
		} );
	},

	_goBack: function() {
		var site = this.state.site;
		page( '/settings/general/' + site.slug );
	}

} );
