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
import SitesListActions from 'lib/sites-list/actions';
import { getSelectedSite } from 'state/ui/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

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
			this.props.recordGoogleEvent( 'Jetpack', 'Clicked To Confirm Disconnect Jetpack Dialog' );
		} else {
			this.props.recordGoogleEvent( 'Jetpack', 'Clicked To Cancel Disconnect Jetpack Dialog' );
		}
	}

	disconnectJetpack() {
		const { site, selectedSite } = this.props;

		// remove any error and completed notices
		SitesListActions.removeSitesNotices( [ { status: 'error' }, { status: 'completed' } ] );

		if ( site ) {
			SitesListActions.disconnect( site );
			if ( selectedSite.ID === site.ID && this.props.redirect ) {
				page.redirect( this.props.redirect );
				return;
			}
		} else if ( this.props.sites ) {
			this.props.sites.getSelectedOrAllWithPlugins().forEach( siteItem => SitesListActions.disconnect( siteItem ) );
		}

		if ( selectedSite.ID === site.ID ) {
			page.redirect( '/sites' );
		}
	}

	renderInfo() {
		const { site } = this.props;

		if ( ! site ) {
			return translate( 'Disconnecting Jetpack will remove access to WordPress.com features.', {
				context: 'Jetpack: Warning message displayed prior to disconnecting multiple Jetpack Sites.'
			} );
		}

		return translate( 'Disconnecting Jetpack will remove access to WordPress.com features for %(siteName)s.', {
			args: {
				siteName: site.name || site.title
			},
			context: 'Jetpack: Warning message displayed prior to disconnecting a Jetpack Site.'
		} );
	}

	render() {
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

		return (
			<Dialog
				isVisible={ this.state.showJetpackDisconnectDialog }
				buttons={ deactivationButtons }
				onClose={ this.close }>
				<h1>{ translate( 'Disconnect Jetpack' ) }</h1>
				<p>{ this.renderInfo() }</p>
			</Dialog>
		);
	}
}

export default connect(
	state => ( {
		selectedSite: getSelectedSite( state )
	} ),
	{
		recordGoogleEvent
	},
	null,
	{
		withRef: true
	}
)( DisconnectJetpackDialog );
