/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';
import {
	getSelectedSiteId,
	getSelectedSite,
} from 'state/ui/selectors';

class ActivityLogCredentialsNotice extends Component {
	render() {
		const {
			selectedSite: { slug },
			translate,
		} = this.props;

		return (
			<CompactCard
				highlight="info"
				href={ `/settings/security/${ slug }` }
				className="activity-log-credentials-notice"
			>
				<span className="activity-log-credentials-notice__icon">
					<Gridicon icon="history" size={ 24 } />
				</span>
				<span className="activity-log-credentials-notice__text">
					{ translate(
						'Add your credentials to enable backups and security scanning for your site.'
					) }
				</span>
			</CompactCard>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			selectedSite: getSelectedSite( state, siteId ),
			siteId,
		};
	}
)( localize( ActivityLogCredentialsNotice ) );
