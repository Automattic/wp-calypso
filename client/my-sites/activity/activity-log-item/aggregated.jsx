/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';
import React, { Component, Fragment } from 'react';
/**
 * Internal dependencies
 */
import ActivityDescription from './activity-description';
import ActivityIcon from './activity-icon';
import ActivityLogItem from '../activity-log-item';
import { adjustMoment } from '../activity-log/utils';
import FoldableCard from 'components/foldable-card';
import { getSite } from 'state/sites/selectors';
import getSiteGmtOffset from 'state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'state/selectors/get-site-timezone-value';
import Button from '../../../components/button';
import { getActivityLogFilter } from 'state/selectors/get-activity-log-filter';
import { filterStateToQuery } from 'state/activity-log/utils';
import { addQueryArgs } from 'lib/url';
import ActivityActor from './activity-actor';

const MAX_STREAM_ITEMS_IN_AGGREGATE = 10;

class ActivityLogAggregatedItem extends Component {
	getViewAllUrl() {
		const {
			activity: { firstPublishedDate, lastPublishedDate },
			filter,
			moment,
			timezone,
		} = this.props;
		const newFilter = Object.assign( {}, omit( filter, [ 'dateRange', 'on' ] ), {
			before: adjustMoment( { timezone, moment: moment( firstPublishedDate ) } )
				.add( 1, 'second' )
				.format(),
			after: adjustMoment( { timezone, moment: moment( lastPublishedDate ) } )
				.subtract( 1, 'second' )
				.format(),
			aggregate: false,
			backButton: true,
		} );
		const query = filterStateToQuery( newFilter );

		return addQueryArgs( query, window.location.pathname + window.location.hash );
	}

	renderHeader() {
		const { activity } = this.props;
		const { actorAvatarUrl, actorName, actorRole, actorType, multipleActors } = activity;
		let actor;
		if ( multipleActors ) {
			actor = <ActivityActor actorType="Multiple" />;
		} else {
			actor = <ActivityActor { ...{ actorAvatarUrl, actorName, actorRole, actorType } } />;
		}

		return (
			<div className="activity-log-item__card-header">
				{ actor }
				<div className="activity-log-item__description">
					<div className="activity-log-item__description-content">
						<ActivityDescription activity={ activity } />
					</div>
				</div>
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
			rewindState,
			siteId,
			timezone,
			translate,
		} = this.props;
		const { activityIcon, activityStatus, activityTs, streamCount } = activity;
		const adjustedTime = adjustMoment( { gmtOffset, moment: moment.utc( activityTs ), timezone } );
		const classes = classNames( 'activity-log-item', 'is-aggregated' );
		return (
			<div className={ classes }>
				<div className="activity-log-item__type">
					<div className="activity-log-item__time" title={ adjustedTime.format( 'LTS' ) }>
						{ adjustedTime.format( 'LT' ) }
					</div>
					<ActivityIcon activityIcon={ activityIcon } activityStatus={ activityStatus } />
				</div>
				<FoldableCard className="activity-log-item__card" header={ this.renderHeader() }>
					{ activity.streams.map( log => (
						<Fragment key={ log.activityId }>
							<ActivityLogItem
								key={ log.activityId }
								activity={ log }
								disableRestore={ disableRestore }
								disableBackup={ disableBackup }
								hideRestore={ 'active' !== rewindState }
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
							<Button href={ this.getViewAllUrl() } compact borderless>
								{ translate( 'View All' ) }
							</Button>
						</div>
					) }
				</FoldableCard>
			</div>
		);
	}
}

const mapStateToProps = ( state, { activity, siteId } ) => {
	const site = getSite( state, siteId );

	return {
		activity,
		gmtOffset: getSiteGmtOffset( state, siteId ),
		timezone: getSiteTimezoneValue( state, siteId ),
		siteSlug: site.slug,
		site,
		filter: getActivityLogFilter( state, siteId ),
	};
};

export default connect(
	mapStateToProps,
	null
)( localize( ActivityLogAggregatedItem ) );
