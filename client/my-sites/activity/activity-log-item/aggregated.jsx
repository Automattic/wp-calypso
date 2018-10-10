/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ActivityDescription from './activity-description';
import ActivityIcon from './activity-icon';
import { adjustMoment } from '../activity-log/utils';
import FoldableCard from 'components/foldable-card';
import { getSite } from 'state/sites/selectors';
import getSiteGmtOffset from 'state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'state/selectors/get-site-timezone-value';

class ActivityLogAggregatedItem extends Component {
	render() {
		const { activity, gmtOffset, moment, timezone } = this.props;
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
					<p>Inner Stuff</p>
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
