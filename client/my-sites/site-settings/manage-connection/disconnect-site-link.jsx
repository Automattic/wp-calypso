/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DisconnectJetpackDialog from 'blocks/disconnect-jetpack/dialog';
import QuerySitePlans from 'components/data/query-site-plans';
import SiteToolsLink from 'my-sites/site-settings/site-tools/link';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isSiteAutomatedTransfer } from 'state/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class DisconnectSiteLink extends Component {
	state = {
		dialogVisible: false,
	};

	handleClick = event => {
		event.preventDefault();

		this.setState( {
			dialogVisible: true,
		} );

		this.props.recordTracksEvent( 'calypso_jetpack_disconnect_start' );
	};

	handleHideDialog = () => {
		this.setState( {
			dialogVisible: false,
		} );
	};

	render() {
		const { isAutomatedTransfer, siteId, translate } = this.props;

		if ( ! siteId || isAutomatedTransfer ) {
			return null;
		}

		return (
			<div className="manage-connection__disconnect-link">
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
					onClose={ this.handleHideDialog }
					isBroken={ false }
					siteId={ siteId }
					disconnectHref="/stats"
				/>
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			isAutomatedTransfer: isSiteAutomatedTransfer( state, siteId ),
			siteId,
		};
	},
	{ recordTracksEvent }
)( localize( DisconnectSiteLink ) );
