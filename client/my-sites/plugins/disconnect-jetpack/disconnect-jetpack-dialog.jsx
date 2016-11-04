/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import sitesList from 'lib/sites-list';
import Dialog from 'components/dialog';
import analytics from 'lib/analytics';
import SitesListActions from 'lib/sites-list/actions';

const sites = sitesList();

const DisconnectJetpackDialog = React.createClass( {
	getInitialState() {
		return {
			showJetpackDisconnectDialog: false
		};
	},

	open() {
		this.setState( {
			showJetpackDisconnectDialog: true
		} );
	},

	close( action ) {
		this.setState( {
			showJetpackDisconnectDialog: false
		} );

		if ( action === 'continue' ) {
			this.disconnectJetpack();
			analytics.ga.recordEvent( 'Jetpack', 'Clicked To Confirm Disconnect Jetpack Dialog' );
		} else {
			analytics.ga.recordEvent( 'Jetpack', 'Clicked To Cancel Disconnect Jetpack Dialog' );
		}
	},

	disconnectJetpack() {
		const { site } = this.props;
		const selectedSite = sites.getSelectedSite();

		// remove any error and completed notices
		SitesListActions.removeSitesNotices( [ { status: 'error' }, { status: 'completed' } ] );

		if ( site ) {
			SitesListActions.disconnect( site );
			if ( selectedSite === site && this.props.redirect ) {
				page.redirect( this.props.redirect );
				return;
			}
		} else if ( this.props.sites ) {
			this.props.sites.getSelectedOrAllWithPlugins().forEach( siteItem => SitesListActions.disconnect( siteItem ) );
		}

		if ( selectedSite === site ) {
			page.redirect( '/sites' );
		}
	},

	render() {
		const { translate, site } = this.props;
		const deactivationButtons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' )
			},
			{
				action: 'continue',
				label: translate( 'Disconnect' ),
				isPrimary: true
			}
		];
		let moreInfo;

		if ( site && site.name || site && site.title ) {
			moreInfo = translate(
				'Disconnecting Jetpack will remove access to WordPress.com features for %(siteName)s.', {
					args: { siteName: site.name || site.title },
					context: 'Jetpack: Warning message displayed prior to disconnecting a Jetpack Site.'
				} );
		} else {
			moreInfo = translate(
				'Disconnecting Jetpack will remove access to WordPress.com features.', {
					context: 'Jetpack: Warning message displayed prior to disconnecting multiple Jetpack Sites.'
				} );
		}

		return (
			<Dialog
				isVisible={ this.state.showJetpackDisconnectDialog }
				buttons={ deactivationButtons }
				onClose={ this.close }
				transitionLeave={ false }>
				<h1>{ translate( 'Disconnect Jetpack' ) }</h1>
				<p>{ moreInfo }</p>
			</Dialog>
		);
	}
} );

export default localize( DisconnectJetpackDialog );
