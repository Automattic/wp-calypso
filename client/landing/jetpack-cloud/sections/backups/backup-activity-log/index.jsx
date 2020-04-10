/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { updateFilter } from 'state/activity-log/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestActivityLogs } from 'state/data-getters';
import { withLocalizedMoment } from 'components/localized-moment';
import getRewindState from 'state/selectors/get-rewind-state';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';
import QueryRewindState from 'components/data/query-rewind-state';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import ActivityCardList from 'landing/jetpack-cloud/components/activity-card-list';

/**
 * Style dependencies
 */
import './style.scss';

class BackupActivityLogPage extends Component {
	render() {
		const { logs, siteId, siteSlug, translate } = this.props;

		return (
			<Main>
				<QueryRewindState siteId={ siteId } />
				<DocumentHead title={ translate( 'Activity' ) } />
				<SidebarNavigation />
				<div className="backup-activity-log">
					<div className="backup-activity-log__header">
						{ translate( 'Find a backup or restore point' ) }
					</div>
					<div className="backup-activity-log__description">
						{ translate(
							'This is the complete event history for your site. Filter by date range and/ or activity type.'
						) }
					</div>
					<ActivityCardList
						{ ...{
							logs,
							pageSize: 10,
							siteSlug,
						} }
					/>
				</div>
			</Main>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const filter = getActivityLogFilter( state, siteId );
	const logs = requestActivityLogs( siteId, filter );
	const rewind = getRewindState( state, siteId );
	const restoreStatus = rewind.rewind && rewind.rewind.status;

	const allowRestore =
		'active' === rewind.state && ! ( 'queued' === restoreStatus || 'running' === restoreStatus );

	return {
		allowRestore,
		filter,
		logs: logs?.data ?? [],
		rewind,
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
	};
};

const mapDispatchToProps = dispatch => ( {
	selectPage: ( siteId, pageNumber ) => dispatch( updateFilter( siteId, { page: pageNumber } ) ),
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( withLocalizedMoment( BackupActivityLogPage ) ) );
