/**
 * External dependencies
 */
import page from 'page';
import React, { Component } from 'react';
import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import analytics from 'lib/analytics';
import SitesListActions from 'lib/sites-list/actions';
import { getSelectedSite } from 'state/ui/selectors';

class DisconnectJetpackDialog extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			showJetpackDisconnectDialog: false
		};

		this.open = this.open.bind( this );
		this.close = this.close.bind( this );
		this.disconnectJetpack = this.disconnectJetpack.bind( this );
	}

	open() {
		this.setState( {
			showJetpackDisconnectDialog: true
		} );
	}

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
	}

	disconnectJetpack() {
		const { site, selectedSite } = this.props;

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
	}

	render() {
		const { site } = this.props;
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
}

export default connect(
	state => ( {
		selectedSite: getSelectedSite( state )
	} ),
	null,
	null,
	{
		withRef: true
	}
)( DisconnectJetpackDialog );
