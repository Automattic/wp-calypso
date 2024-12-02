import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import SiteToolsLink from 'calypso/my-sites/site-settings/site-tools/link';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			isAutomatedTransfer: isSiteAutomatedTransfer( state, siteId ),
			siteId,
			siteSlug: getSiteSlug( state, siteId ),
		};
	},
	{ recordTracksEvent }
)( localize( DisconnectSiteLink ) );
