/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isMobile } from '@automattic/viewport';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getSelectedSiteId } from 'state/ui/selectors';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { requestActivityLogs } from 'state/data-getters';
import { emptyFilter } from 'state/activity-log/reducer';
import { withLocalizedMoment } from 'components/localized-moment';
import Gridicon from 'components/gridicon';
import FoldableCard from 'components/foldable-card';
import { Button } from '@automattic/components';
import Filterbar from 'my-sites/activity/filterbar';
import { updateFilter } from 'state/activity-log/actions';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import Pagination from 'components/pagination';
import ActivityCard from '../../../components/activity-card';
import { getEventsInDailyBackup } from '../utils';

const PAGE_SIZE = 10;

class BackupDetailPage extends Component {
	changePage = pageNumber => {
		this.props.selectPage( this.props.siteId, pageNumber );
		window.scrollTo( 0, 0 );
	};

	render() {
		const { backupId, filter, logs, moment, siteId, translate } = this.props;
		const { page: requestedPage } = filter;

		const backups = logs.filter( event => event.rewindId === backupId );
		const thisBackup = backups[ 0 ];
		const meta = get( thisBackup, 'activityDescription[2].children[0]', '' );

		const metaList =
			meta &&
			meta.split( ', ' ).map( item => {
				return <li key={ item }>{ item }</li>;
			} );

		const actualLogs =
			( thisBackup && getEventsInDailyBackup( logs, new Date( thisBackup.activityDate ) ) ) || [];

		const actualPage = Math.max(
			1,
			Math.min( requestedPage, Math.ceil( actualLogs.length / PAGE_SIZE ) )
		);
		const theseLogs = actualLogs.slice( ( actualPage - 1 ) * PAGE_SIZE, actualPage * PAGE_SIZE );

		const cards = theseLogs.map( activity => (
			<ActivityCard
				{ ...{
					key: activity.activityId,
					moment,
					activity,
					allowRestore: false,
				} }
			/>
		) );

		return (
			<Main>
				<DocumentHead title="Backup Details" />
				<SidebarNavigation />
				<div>
					<Gridicon icon="cloud-upload" />
					{ thisBackup && moment( thisBackup.activityDate ).format( 'YYYY-MM-DD' ) }
				</div>
				<div>
					<Button primary={ false }>{ translate( 'Download backup' ) }</Button>
					<Button primary={ true }>{ translate( 'Restore to this point' ) }</Button>
				</div>
				<FoldableCard header={ translate( 'Total # of files backed up' ) }>
					<ul>{ metaList }</ul>
				</FoldableCard>
				{ actualLogs.length > PAGE_SIZE ? (
					<Fragment>
						<div>{ translate( 'Backup details' ) }</div>
						<Filterbar
							{ ...{
								siteId,
								filter,
								isLoading: false,
								isVisible: true,
							} }
						/>
					</Fragment>
				) : (
					<div>{ translate( 'This backup contains no changes.' ) }</div>
				) }
				{ actualLogs.length > PAGE_SIZE && (
					<Pagination
						compact={ isMobile() }
						className="detail__pagination"
						key="detail__pagination-top"
						nextLabel={ 'Older' }
						page={ actualPage }
						pageClick={ this.changePage }
						perPage={ PAGE_SIZE }
						prevLabel={ 'Newer' }
						total={ actualLogs.length }
					/>
				) }
				{ cards }
				{ actualLogs.length > PAGE_SIZE && (
					<Pagination
						compact={ isMobile() }
						className="detail__pagination"
						key="detail__pagination-bottom"
						nextLabel={ 'Older' }
						page={ actualPage }
						pageClick={ this.changePage }
						perPage={ PAGE_SIZE }
						prevLabel={ 'Newer' }
						total={ actualLogs.length }
					/>
				) }
			</Main>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const logs = siteId && requestActivityLogs( siteId, emptyFilter );
	const filter = getActivityLogFilter( state, siteId );

	return {
		filter,
		logs: logs?.data ?? [],
		siteId,
	};
};

const mapDispatchToProps = dispatch => ( {
	selectPage: ( siteId, pageNumber ) => dispatch( updateFilter( siteId, { page: pageNumber } ) ),
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( withLocalizedMoment( BackupDetailPage ) ) );
