/**
 * External dependencies
 */
var page = require( 'page' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var sites = require( 'lib/sites-list' )(),
	Dialog = require( 'components/dialog' ),
	analytics = require( 'analytics' ),
	SitesListActions = require( 'lib/sites-list/actions' );

module.exports = React.createClass( {

	displayName: 'DisconnectJetpackDialog',

	getInitialState: function() {
		return { showJetpackDisconnectDialog: false };
	},

	open: function() {
		this.setState( { showJetpackDisconnectDialog: true } );
	},

	close: function( action ) {
		this.setState( { showJetpackDisconnectDialog: false } );
		if ( action === 'continue' ) {
			this.disconnectJetpack();
			analytics.ga.recordEvent( 'Jetpack', 'Clicked To Confirm Disconnect Jetpack Dialog' );
		} else {
			analytics.ga.recordEvent( 'Jetpack', 'Clicked To Cancel Disconnect Jetpack Dialog' );
		}
	},

	jetpackSiteRemain: function( site ) {
		return site.capabilities && site.capabilities.manage_options && site.ID !== this.props.site.ID;
	},

	disconnectJetpack: function() {
		var jetpackSites = sites.getJetpack();

		// remove any error and completed notices
		SitesListActions.removeSitesNotices( [ { status: 'error' }, { status: 'completed' } ] );

		if ( this.props.site ) {
			SitesListActions.disconnect( this.props.site );
			if ( this.props.redirect && jetpackSites.some( this.jetpackSiteRemain ) ) {
				page.redirect( this.props.redirect );
				return;
			}
		} else if ( this.props.sites ) {
			this.props.sites.getSelectedOrAllWithPlugins().forEach( function( site ) {
				SitesListActions.disconnect( site );
			} );
		}
		page.redirect( '/sites' );
	},

	render: function() {
		var moreInfo,
			deactivationButtons = [
				{
					action: 'cancel',
					label: this.translate( 'Cancel' )
				},
				{
					action: 'continue',
					label: this.translate( 'Disconnect' ),
					isPrimary: true
				}
			];

		if ( this.props.site && this.props.site.name || this.props.site && this.props.site.title ) {
			moreInfo = this.translate(
				'Disconnecting Jetpack will remove access to WordPress.com features for %(siteName)s.', {
					args: { siteName: this.props.site.name || this.props.site.title },
					context: 'Jetpack: Warning message displayed prior to disconnecting a Jetpack Site.'
				} );
		} else {
			moreInfo = this.translate(
				'Disconnecting Jetpack will remove access to WordPress.com features.', {
					context: 'Jetpack: Warning message displayed prior to disconnecting multiple Jetpack Sites.'
				} );
		}

		return (
			<Dialog
				isVisible={ this.state.showJetpackDisconnectDialog }
				buttons={ deactivationButtons }
				onClose={ this.close }
				transitionLeave={ false }
			>
				<h1>{ this.translate( 'Disconnect Jetpack' ) }</h1>
				<p>{ moreInfo }</p>
			</Dialog>
		);
	}
} );
