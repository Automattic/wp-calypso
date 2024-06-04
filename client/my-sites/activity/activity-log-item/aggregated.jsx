import { Button, FoldableCard } from '@automattic/components';
import { withDesktopBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { omit, flowRight as compose } from 'lodash';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { addQueryArgs } from 'calypso/lib/url';
import { filterStateToQuery } from 'calypso/state/activity-log/utils';
import { getActivityLogFilter } from 'calypso/state/selectors/get-activity-log-filter';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import ActivityLogItem from '../activity-log-item';
import ActivityActor from './activity-actor';
import ActivityDescription from './activity-description';
import ActivityIcon from './activity-icon';
import ActivityMedia from './activity-media';

const MAX_STREAM_ITEMS_IN_AGGREGATE = 10;

class ActivityLogAggregatedItem extends Component {
	getViewAllUrl() {
		const {
			activity: { firstPublishedDate, lastPublishedDate },
			filter,
			timezone,
		} = this.props;
		const newFilter = Object.assign( {}, omit( filter, [ 'dateRange', 'on' ] ), {
			before: applySiteOffset( firstPublishedDate, { timezone } ).add( 1, 'second' ).format(),
			after: applySiteOffset( lastPublishedDate, { timezone } ).subtract( 1, 'second' ).format(),
			aggregate: false,
			backButton: true,
		} );
		const query = filterStateToQuery( newFilter );

		return addQueryArgs( query, window.location.pathname + window.location.hash );
	}

	trackClick = ( intent ) => {
		const { activity } = this.props;
		const section = activity.activityGroup;
		recordTracksEvent( 'calypso_activitylog_item_click', {
			activity: activity.activityName,
			section,
			intent: intent,
			is_aggregate: true,
			stream_count: activity.streamCount,
		} );
	};

	trackAggregateExpandToggle = () => {
		this.trackClick( 'toggle' );
	};

	trackAggregateViewAll = () => {
		this.trackClick( 'view_all' );
	};

	renderHeader() {
		const { activity, isBreakpointActive: isDesktop } = this.props;
		const { actorAvatarUrl, actorName, actorRole, actorType, multipleActors, activityMedia } =
			activity;
		let actor;
		if ( multipleActors ) {
			actor = <ActivityActor actorType="Multiple" />;
		} else {
			actor = <ActivityActor { ...{ actorAvatarUrl, actorName, actorRole, actorType } } />;
		}

		return (
			<div className="activity-log-item__card-header">
				{ actor }
				{ activityMedia && isDesktop && (
					<ActivityMedia
						className={ clsx( {
							'activity-log-item__activity-media': true,
							'is-desktop': true,
							'has-gridicon': ! activityMedia.available,
						} ) }
						icon={ ! activityMedia.available && activityMedia.gridicon }
						name={ activityMedia.available && activityMedia.name }
						thumbnail={ activityMedia.available && activityMedia.thumbnail_url }
						fullImage={ false }
					/>
				) }
				<div className="activity-log-item__description">
					<div className="activity-log-item__description-content">
						<ActivityDescription activity={ activity } />
					</div>
				</div>
				{ activityMedia && ! isDesktop && (
					<ActivityMedia
						className="activity-log-item__activity-media is-mobile"
						icon={ false }
						name={ activityMedia.available && activityMedia.name }
						thumbnail={ false }
						fullImage={ activityMedia.available && activityMedia.medium_url }
					/>
				) }
			</div>
		);
	}

	render() {
		const {
			activity,
			disableBackup,
			disableRestore,
			gmtOffset,
			moment,
			siteId,
			timezone,
			translate,
		} = this.props;
		const { activityIcon, activityStatus, activityTs, streamCount } = activity;
		const adjustedTime = applySiteOffset( moment( activityTs ), { timezone, gmtOffset } );
		const classes = clsx( 'activity-log-item', 'is-aggregated' );
		return (
			<div className={ classes }>
				<div className="activity-log-item__type">
					<div className="activity-log-item__time" title={ adjustedTime.format( 'LTS' ) }>
						{ adjustedTime.format( 'LT' ) }
					</div>
					<ActivityIcon activityIcon={ activityIcon } activityStatus={ activityStatus } />
				</div>
				<FoldableCard
					className="activity-log-item__card"
					header={ this.renderHeader() }
					onClick={ this.trackAggregateExpandToggle }
				>
					{ activity.streams.map( ( log ) => (
						<Fragment key={ log.activityId }>
							<ActivityLogItem
								key={ log.activityId }
								activity={ log }
								disableRestore={ disableRestore }
								disableBackup={ disableBackup }
								siteId={ siteId }
							/>
						</Fragment>
					) ) }
					{ streamCount > MAX_STREAM_ITEMS_IN_AGGREGATE && (
						<div className="activity-log-item__footer">
							<p>
								{ translate( 'Showing %(number)d of %(total)d activities', {
									args: { number: MAX_STREAM_ITEMS_IN_AGGREGATE, total: streamCount },
								} ) }
							</p>
							<Button
								href={ this.getViewAllUrl() }
								compact
								borderless
								onClick={ this.trackAggregateViewAll }
							>
								{ translate( 'View All' ) }
							</Button>
						</div>
					) }
				</FoldableCard>
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	gmtOffset: getSiteGmtOffset( state, siteId ),
	timezone: getSiteTimezoneValue( state, siteId ),
	siteSlug: getSiteSlug( state, siteId ),
	filter: getActivityLogFilter( state, siteId ),
} );

export default compose(
	connect( mapStateToProps ),
	withDesktopBreakpoint,
	withLocalizedMoment,
	localize
)( ActivityLogAggregatedItem );
