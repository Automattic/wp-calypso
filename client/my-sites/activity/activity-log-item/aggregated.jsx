/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
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

const MAX_STREAM_ITEMS_IN_AGGREGATE = 10;

class ActivityLogAggregatedItem extends Component {
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
				<FoldableCard
					className="activity-log-item__card"
					header={ <ActivityDescription activity={ activity } /> }
				>
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
	};
};

export default connect(
	mapStateToProps,
	null
)( localize( ActivityLogAggregatedItem ) );
