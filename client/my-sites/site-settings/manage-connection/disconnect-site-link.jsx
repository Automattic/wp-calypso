/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SiteToolsLink from 'client/my-sites/site-settings/site-tools/link';
import { getSiteSlug } from 'client/state/sites/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { isSiteAutomatedTransfer } from 'client/state/selectors';
import { recordTracksEvent } from 'client/state/analytics/actions';

class DisconnectSiteLink extends PureComponent {
	handleClick = () => {
		this.props.recordTracksEvent( 'calypso_jetpack_disconnect_start' );
	};

	render() {
		const { isAutomatedTransfer, siteId, siteSlug, translate } = this.props;

		if ( ! siteId || isAutomatedTransfer ) {
			return null;
		}

		return (
			<div className="manage-connection__disconnect-link">
				<SiteToolsLink
					href={ '/settings/disconnect-site/' + siteSlug }
					onClick={ this.handleClick }
					title={ translate( 'Disconnect from WordPress.com' ) }
					description={ translate(
						'Your site will no longer send data to WordPress.com and Jetpack features will stop working.'
					) }
					isWarning
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
			siteSlug: getSiteSlug( state, siteId ),
		};
	},
	{ recordTracksEvent }
)( localize( DisconnectSiteLink ) );
