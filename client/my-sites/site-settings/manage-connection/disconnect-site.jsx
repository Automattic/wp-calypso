/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import DisconnectJetpackDialog from 'blocks/disconnect-jetpack-dialog';
import QuerySitePlans from 'components/data/query-site-plans';
import SiteToolsLink from 'my-sites/site-settings/site-tools/link';
import { recordGoogleEvent } from 'state/analytics/actions';
import { disconnect } from 'state/jetpack/connection/actions';
import { disconnectedSite as disconnectedSiteDeprecated } from 'lib/sites-list/actions';
import { setAllSitesSelected } from 'state/ui/actions';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getPlanClass } from 'lib/plans/constants';
import { successNotice, errorNotice, infoNotice, removeNotice } from 'state/notices/actions';

class DisconnectSite extends Component {
	state = {
		dialogVisible: false,
	}

	handleClick = ( event ) => {
		event.preventDefault();

		this.setState( {
			dialogVisible: true,
		} );
	}

	handleHideDialog = () => {
		this.setState( {
			dialogVisible: false
		} );
	}

	disconnectJetpack = () => {
		const {
			site,
			siteId,
			translate,
			successNotice: showSuccessNotice,
			errorNotice: showErrorNotice,
			infoNotice: showInfoNotice,
			removeNotice: removeInfoNotice,
			disconnect: disconnectSite,
			recordGoogleEvent: recordGAEvent
		} = this.props;

		this.setState( {
			dialogVisible: false
		} );

		recordGAEvent( 'Jetpack', 'Clicked To Confirm Disconnect Jetpack Dialog' );

		const { notice } = showInfoNotice(
			translate( 'Disconnecting %(siteName)s.', { args: { siteName: site.title } } ),	{
				isPersistent: true,
				showDismiss: false,
			}
		);

		disconnectSite( siteId ).then( () => {
			// Removing the domain from a domain-only site results
			// in the site being deleted entirely. We need to call
			// `receiveDeletedSiteDeprecated` here because the site
			// exists in `sites-list` as well as the global store.
			disconnectedSiteDeprecated( site );
			this.props.setAllSitesSelected();
			removeInfoNotice( notice.noticeId );
			showSuccessNotice( translate( 'Successfully disconnected %(siteName)s.', { args: { siteName: site.title } } ) );
			recordGAEvent( 'Jetpack', 'Successfully Disconnected' );
		}, () => {
			removeInfoNotice( notice.noticeId );
			showErrorNotice( translate( '%(siteName)s failed to disconnect', { args: { siteName: site.title } } ) );
			recordGAEvent( 'Jetpack', 'Failed Disconnected Site' );
		}, );

		page.redirect( '/stats' );
	}

	render() {
		const {
			planClass,
			site,
			siteId,
			siteSlug,
			translate
		} = this.props;

		if ( ! site ) {
			return null;
		}

		return (
			<div>
				<QuerySitePlans siteId={ siteId } />

				<SiteToolsLink
					href="#"
					onClick={ this.handleClick }
					title={ translate( 'Disconnect from WordPress.com' ) }
					description={ translate(
						'Your site will no longer send data to WordPress.com and Jetpack features will stop working.'
					) }
					isWarning
				/>

				<DisconnectJetpackDialog
					isVisible={ this.state.dialogVisible }
					onDisconnect={ this.disconnectJetpack }
					onClose={ this.handleHideDialog }
					plan={ planClass }
					isBroken={ false }
					siteName={ siteSlug }
				/>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSelectedSiteSlug( state );
		const plan = getCurrentPlan( state, siteId );
		const planClass = plan && plan.productSlug
			? getPlanClass( plan.productSlug )
			: 'is-free-plan';

		return {
			planClass,
			site,
			siteId,
			siteSlug,
		};
	},
	{
		setAllSitesSelected,
		recordGoogleEvent,
		disconnect,
		successNotice,
		errorNotice,
		infoNotice,
		removeNotice
	}
)( localize( DisconnectSite ) );
