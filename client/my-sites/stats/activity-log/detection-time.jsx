/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

export class DetectionTime extends Component {
	render() {
		const { date, moment, translate } = this.props;
		const weeksAgo = moment().diff( moment( date ), 'weeks' );

		return (
			<time className="activity-log__detection-time" dateTime={ date.toISOString() }>
				{ weeksAgo > 1
					? translate( '%(weeks)sw', { args: { weeks: weeksAgo } } )
					: moment.duration( moment( date ).diff( moment() ) ).humanize( true ) }
			</time>
		);
	}
}

export default localize( DetectionTime );
