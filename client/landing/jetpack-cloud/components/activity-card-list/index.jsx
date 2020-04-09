/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isMobile } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import ActivityCard from 'landing/jetpack-cloud/components/activity-card';
import getRewindCapabilities from 'state/selectors/get-rewind-capabilities';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import QueryRewindCapabilities from 'components/data/query-rewind-capabilities';
import getRewindState from 'state/selectors/get-rewind-state';
import QueryRewindState from 'components/data/query-rewind-state';
import { getSelectedSiteId } from 'state/ui/selectors';
import { updateFilter } from 'state/activity-log/actions';
import { withLocalizedMoment } from 'components/localized-moment';
import Filterbar from 'my-sites/activity/filterbar';
import Pagination from 'components/pagination';

/**
 * Style dependencies
 */
import './style.scss';

class ActivityCardList extends Component {
	static defaultProps = {
		showFilter: true,
		showPagination: true,
	};

	changePage = pageNumber => {
		this.props.selectPage( this.props.siteId, pageNumber );
		window.scrollTo( 0, 0 );
	};

	render() {
		const {
			allowRestore,
			filter,
			moment,
			logs,
			pageSize,
			showFilter,
			showPagination,
			siteId,
		} = this.props;
		const { page: requestedPage } = filter;

		const actualPage = Math.max(
			1,
			Math.min( requestedPage, Math.ceil( logs.length / pageSize ) )
		);
		const theseLogs = logs.slice( ( actualPage - 1 ) * pageSize, actualPage * pageSize );

		const cards = theseLogs.map( activity => (
			<ActivityCard
				{ ...{
					key: activity.activityId,
					moment,
					activity,
					allowRestore,
				} }
			/>
		) );

		return (
			<div className="activity-card-list">
				<QueryRewindCapabilities siteId={ siteId } />
				<QueryRewindState siteId={ siteId } />
				{ showFilter && (
					<Filterbar
						{ ...{
							siteId,
							filter,
							isLoading: false,
							isVisible: true,
						} }
					/>
				) }
				{ showPagination && (
					<Pagination
						compact={ isMobile() }
						className="activity-card-list__pagination"
						key="activity-card-list__pagination-top"
						nextLabel={ 'Older' }
						page={ actualPage }
						pageClick={ this.changePage }
						perPage={ pageSize }
						prevLabel={ 'Newer' }
						total={ logs.length }
					/>
				) }
				{ cards }
				{ showPagination && (
					<Pagination
						compact={ isMobile() }
						className="activity-card-list__pagination"
						key="activity-card-list__pagination-bottom"
						nextLabel={ 'Older' }
						page={ actualPage }
						pageClick={ this.changePage }
						perPage={ pageSize }
						prevLabel={ 'Newer' }
						total={ logs.length }
					/>
				) }
			</div>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const filter = getActivityLogFilter( state, siteId );
	const rewind = getRewindState( state, siteId );
	const siteCapabilities = getRewindCapabilities( state, siteId );
	const restoreStatus = rewind.rewind && rewind.rewind.status;
	const allowRestore =
		'active' === rewind.state &&
		! ( 'queued' === restoreStatus || 'running' === restoreStatus ) &&
		siteCapabilities.includes( 'restore' );

	return {
		siteId,
		filter,
		rewind,
		allowRestore,
	};
};

const mapDispatchToProps = dispatch => ( {
	selectPage: ( siteId, pageNumber ) => dispatch( updateFilter( siteId, { page: pageNumber } ) ),
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( withLocalizedMoment( ActivityCardList ) );
