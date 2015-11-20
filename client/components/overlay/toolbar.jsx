/**
 * External Dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:overlay:toolbar' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	SiteIcon = require( 'components/site-icon' );

module.exports = React.createClass({
	displayName: 'OverlayToolbar',

	componentDidMount: function() {
		debug( 'The OverlayToolbar component is mounted.' );
	},

	renderSiteContext: function() {
		var site = sites.getSelectedSite(),
			allSites;

		if ( ! sites.initialized ) {
			return;
		}

		if ( sites.selected ) {
			site = sites.getSelectedSite();
		} else {
			site = sites.getPrimary();
		}

		allSites = (
			<a className="site all-sites" key="all-sites-selected">
				<SiteIcon />
				<span className="site-title">{ this.translate( 'All My Sites' ) }</span>
				<span className="site-description">{ this.translate( 'Manage all my sites' ) }</span>
			</a>
		);

		return (
			<div className="current-site">
				{ sites.selected ?
					<a className="site" key={ site.ID }>
						<SiteIcon site={ site } />
						<span className="site-title">{ site.title }</span>
						<span className="site-description">{ site.domain }</span>
					</a>
				: allSites }
			</div>
		);
	},

	renderUserContext: function() {
		// This should go in dependencies
		var user = require( 'lib/user' )();

		return (
			<div className="current-site">
				<a className="site all-sites" key="all-sites-selected">
					<div className="site-icon user-icon">
						<img src={ user.getAvatarUrl( { s: 102 } ) } />
					</div>
					<span className="site-title">{ user.data.display_name }</span>
					<span className="site-description">{ this.props.title }</span>
				</a>
			</div>
		);
	},

	renderContext: function() {
		// If there is no site context, let's use user context.
		if ( undefined === this.props.context ) {
			return this.renderUserContext();
		}

		return this.renderSiteContext();
	},

	render: function() {
		var primary = '',
			secondary = '';

		/**
		 * The primary and secondary buttons with their actions
		 */
		if ( this.props.primary ) {
			primary = ( <li><a className="button is-primary" onClick={ this.props.primary.action }>{ this.props.primary.title }</a></li> );
		}

		if ( this.props.secondary ) {
			secondary = ( <li><a className="button settings-done" href={ this.props.back } onCLick={ this.props.secondary.action }>{ this.props.secondary.title }</a></li> );
		}

		return (
			<header id="overlay-header" className="toolbar wpcom-masterbar wpcom-header">
				<div className="wpcom-navigation overlay-navigation" role="navigation">
					<nav className="user-actions">
						{ this.renderContext() }
						<ul className="actions-menu">
							{ primary }
							{ secondary }
						</ul>
					</nav>
				</div>
			</header>
		);
	}

});
