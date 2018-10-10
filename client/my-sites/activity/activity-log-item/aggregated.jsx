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
		} = this.props;
		const { activityIcon, activityStatus, activityTs } = activity;
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
