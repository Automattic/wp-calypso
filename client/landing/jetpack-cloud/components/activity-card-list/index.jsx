/**
 * External dependencies
 */
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { updateFilter } from 'state/activity-log/actions';
import { withApplySiteOffset } from '../site-offset';
import { withLocalizedMoment } from 'components/localized-moment';
import { withMobileBreakpoint } from '@automattic/viewport-react';
import ActivityCard from 'landing/jetpack-cloud/components/activity-card';
import Filterbar from 'my-sites/activity/filterbar';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import getRewindCapabilities from 'state/selectors/get-rewind-capabilities';
import getRewindState from 'state/selectors/get-rewind-state';
import Pagination from 'components/pagination';
import QueryRewindCapabilities from 'components/data/query-rewind-capabilities';
import QueryRewindState from 'components/data/query-rewind-state';

/**
 * Style dependencies
 */
import './style.scss';

class ActivityCardList extends Component {
	static propTypes = {
		logs: PropTypes.array.isRequired,
		pageSize: PropTypes.number.isRequired,
		showDateSeparators: PropTypes.bool,
		showFilter: PropTypes.bool,
		showPagination: PropTypes.bool,
	};

	static defaultProps = {
		showDateSeparators: true,
		showFilter: true,
		showPagination: true,
	};

	changePage = ( pageNumber ) => {
		this.props.selectPage( this.props.siteId, pageNumber );
		window.scrollTo( 0, 0 );
	};

	splitLogsByDate( logs ) {
		const { applySiteOffset, moment } = this.props;
		const logsByDate = [];
		let lastDate = null;
		for ( const log of logs ) {
			const activityDateMoment = applySiteOffset( moment( log.activityDate ) );
			if ( activityDateMoment ) {
				if ( lastDate && lastDate.isSame( activityDateMoment, 'day' ) ) {
					logsByDate[ logsByDate.length - 1 ].logs.push( log );
				} else {
					logsByDate.push( { date: activityDateMoment, logs: [ log ] } );
					lastDate = activityDateMoment;
				}
			}
		}
		return logsByDate;
	}

	renderLogs( logs ) {
		const { allowRestore, moment, siteSlug, showDateSeparators } = this.props;
		const logsByDate = this.splitLogsByDate( logs );

		return logsByDate.map( ( { date, logs: dateLogs }, index ) => {
			return (
				<div key={ `activity-card-list__date-group-${ index }` }>
					{ showDateSeparators && (
						<div className="activity-card-list__date-group-date">
							{ date && date.format( 'MMM Do' ) }
						</div>
					) }
					<div className="activity-card-list__date-group-content">
						{ dateLogs.map( ( activity ) => (
							<ActivityCard
								{ ...{
									key: activity.activityId,
									moment,
									activity,
									allowRestore,
									siteSlug,
									className:
										activity.activityType === 'Backup'
											? 'activity-card-list__primary-card'
											: 'activity-card-list__secondary-card',
								} }
							/>
						) ) }
					</div>
				</div>
			);
		} );
	}

	renderData() {
		const {
			filter,
			isBreakpointActive: isMobile,
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
		return (
			<>
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
						compact={ isMobile }
						className="activity-card-list__pagination-top"
						key="activity-card-list__pagination-top"
						nextLabel={ 'Older' }
						page={ actualPage }
						pageClick={ this.changePage }
						perPage={ pageSize }
						prevLabel={ 'Newer' }
						total={ logs.length }
					/>
				) }
				{ this.renderLogs( theseLogs ) }
				{ showPagination && (
					<Pagination
						compact={ isMobile }
						className="activity-card-list__pagination-bottom"
						key="activity-card-list__pagination-bottom"
						nextLabel={ 'Older' }
						page={ actualPage }
						pageClick={ this.changePage }
						perPage={ pageSize }
						prevLabel={ 'Newer' }
						total={ logs.length }
					/>
				) }
			</>
		);
	}

	render() {
		const { applySiteOffset, siteId } = this.props;

		return (
			<div className="activity-card-list">
				<QueryRewindCapabilities siteId={ siteId } />
				<QueryRewindState siteId={ siteId } />
				{ applySiteOffset && this.renderData() }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const filter = getActivityLogFilter( state, siteId );
	const rewind = getRewindState( state, siteId );
	const siteCapabilities = getRewindCapabilities( state, siteId );
	const restoreStatus = rewind.rewind && rewind.rewind.status;
	const allowRestore =
		'active' === rewind.state &&
		! ( 'queued' === restoreStatus || 'running' === restoreStatus ) &&
		Array.isArray( siteCapabilities ) &&
		siteCapabilities.includes( 'restore' );

	return {
		siteId,
		siteSlug,
		filter,
		rewind,
		allowRestore,
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	selectPage: ( siteId, pageNumber ) => dispatch( updateFilter( siteId, { page: pageNumber } ) ),
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( withMobileBreakpoint( withApplySiteOffset( withLocalizedMoment( ActivityCardList ) ) ) );
