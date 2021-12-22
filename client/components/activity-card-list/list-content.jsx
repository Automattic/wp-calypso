import { withMobileBreakpoint } from '@automattic/viewport-react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ActivityCard from 'calypso/components/activity-card';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Pagination from 'calypso/components/pagination';
import { withApplySiteOffset } from 'calypso/components/site-offset';
import { isActivityBackup } from 'calypso/lib/jetpack/backup-utils';
import { updateFilter } from 'calypso/state/activity-log/actions';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getRewindPoliciesRequestStatus from 'calypso/state/rewind/selectors/get-rewind-policies-request-status';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import VisibleDaysLimitUpsell from './visible-days-limit-upsell';

class ListContent extends Component {
	static propTypes = {
		showDateSeparators: PropTypes.bool,
		showPagination: PropTypes.bool,
		logs: PropTypes.array,
		pageSize: PropTypes.number.isRequired,
	};

	static defaultProps = {
		showDateSeparators: true,
		showPagination: true,
	};

	changePage = ( pageNumber ) => {
		this.props.selectPage( this.props.siteId, pageNumber );
		window.scrollTo( 0, 0 );
	};

	splitLogsByDate( logs ) {
		const { applySiteOffset, moment, pageSize } = this.props;
		const logsByDate = [];
		let lastDate = null;
		let logsAdded = 0;

		for ( const log of logs ) {
			const activityDateMoment = ( applySiteOffset ?? moment )( log.activityDate );

			if ( logsAdded >= pageSize ) {
				if ( lastDate && lastDate.isSame( activityDateMoment, 'day' ) ) {
					logsByDate[ logsByDate.length - 1 ].hasMore = true;
				}
				break;
			} else {
				if ( lastDate && lastDate.isSame( activityDateMoment, 'day' ) ) {
					logsByDate[ logsByDate.length - 1 ].logs.push( log );
				} else {
					logsByDate.push( { date: activityDateMoment, logs: [ log ], hasMore: false } );
					lastDate = activityDateMoment;
				}
				logsAdded++;
			}
		}

		return logsByDate;
	}

	renderLogs( pageLogs ) {
		const { applySiteOffset, moment, showDateSeparators, translate, userLocale } = this.props;

		const today = ( applySiteOffset ?? moment )();

		const getPrimaryCardClassName = ( hasMore, dateLogsLength ) =>
			hasMore && dateLogsLength === 1
				? 'activity-card-list__primary-card-with-more'
				: 'activity-card-list__primary-card';

		const getSecondaryCardClassName = ( hasMore ) =>
			hasMore
				? 'activity-card-list__secondary-card-with-more'
				: 'activity-card-list__secondary-card';

		const dateFormat = userLocale === 'en' ? 'MMM Do' : 'LL';

		return pageLogs.map( ( { date, logs: dateLogs, hasMore }, index ) => (
			<div key={ `activity-card-list__date-group-${ index }` }>
				{ showDateSeparators && (
					<div className="activity-card-list__date-group-date">
						{ date &&
							( today?.isSame( date, 'day' ) ? translate( 'Today' ) : date.format( dateFormat ) ) }
					</div>
				) }
				<div className="activity-card-list__date-group-content">
					{ dateLogs.map( ( activity ) => (
						<ActivityCard
							activity={ activity }
							className={
								isActivityBackup( activity )
									? getPrimaryCardClassName( hasMore, dateLogs.length )
									: getSecondaryCardClassName( hasMore )
							}
							key={ activity.activityId }
						/>
					) ) }
				</div>
			</div>
		) );
	}

	render() {
		const {
			applySiteOffset,
			moment,
			translate,
			visibleDays,
			filter,
			isBreakpointActive: isMobile,
			logs,
			pageSize,
			showPagination,
		} = this.props;

		const visibleLimitCutoffDate = Number.isFinite( visibleDays )
			? ( applySiteOffset ?? moment )().subtract( visibleDays, 'days' )
			: undefined;
		const visibleLogs = visibleLimitCutoffDate
			? logs.filter( ( log ) =>
					( applySiteOffset ?? moment )( log.activityDate ).isSameOrAfter(
						visibleLimitCutoffDate,
						'day'
					)
			  )
			: logs;

		const { page: requestedPage } = filter;
		const pageCount = Math.ceil( visibleLogs.length / pageSize );
		const actualPage = Math.max( 1, Math.min( requestedPage, pageCount ) );

		const pageLogs = this.splitLogsByDate( visibleLogs.slice( ( actualPage - 1 ) * pageSize ) );
		const showLimitUpsell = visibleLogs.length < logs.length && actualPage >= pageCount;

		return (
			<>
				{ showPagination && (
					<Pagination
						compact={ isMobile }
						className="activity-card-list__pagination-top"
						key="activity-card-list__pagination-top"
						nextLabel={ translate( 'Older' ) }
						page={ actualPage }
						pageClick={ this.changePage }
						perPage={ pageSize }
						prevLabel={ translate( 'Newer' ) }
						total={ visibleLogs.length }
					/>
				) }
				{ this.renderLogs( pageLogs ) }
				{ showLimitUpsell && (
					<VisibleDaysLimitUpsell cardClassName="activity-card-list__primary-card-with-more" />
				) }
				{ showPagination && (
					<Pagination
						compact={ isMobile }
						className="activity-card-list__pagination-bottom"
						key="activity-card-list__pagination-bottom"
						nextLabel={ translate( 'Older' ) }
						page={ actualPage }
						pageClick={ this.changePage }
						perPage={ pageSize }
						prevLabel={ translate( 'Newer' ) }
						total={ visibleLogs.length }
					/>
				) }
			</>
		);
	}
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	const filter = getActivityLogFilter( state, siteId );
	const userLocale = getCurrentUserLocale( state );
	const visibleDays = getActivityLogVisibleDays( state, siteId );

	const rewindPoliciesRequestStatus = getRewindPoliciesRequestStatus( state, siteId );

	return {
		filter,
		requestingRewindPolicies: rewindPoliciesRequestStatus === 'pending',
		rewindPoliciesRequestError: rewindPoliciesRequestStatus === 'failure',
		visibleDays,
		siteId,
		siteSlug,
		userLocale,
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	selectPage: ( siteId, pageNumber ) => dispatch( updateFilter( siteId, { page: pageNumber } ) ),
} );

/** @type {typeof ListContent} */
const connectedComponent = connect(
	mapStateToProps,
	mapDispatchToProps
)( withMobileBreakpoint( withApplySiteOffset( withLocalizedMoment( localize( ListContent ) ) ) ) );

export default connectedComponent;
