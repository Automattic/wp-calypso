/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Week from './week';

class PostTrendsMonth extends Component {
	static propTypes = {
		startDate: PropTypes.object.isRequired,
		streakData: PropTypes.object,
		max: PropTypes.number,
		moment: PropTypes.func,
	};

	getWeekComponents() {
		const { moment } = this.props;
		const monthStart = moment( this.props.startDate ).locale( 'en' );
		const monthEnd = moment( monthStart ).endOf( 'month' );
		const weekStart = moment( monthStart ).startOf( 'week' );
		const weeks = [];

		// Stat weeks start on Monday and end on Sunday
		if ( 0 === monthStart.day() ) {
			weekStart.subtract( 6, 'day' );
		} else {
			weekStart.add( 1, 'day' );
		}

		do {
			weeks.push(
				<Week
					key={ weekStart.format( 'YYYYMMDD' ) }
					startDate={ moment( weekStart ) }
					month={ monthStart }
					streakData={ this.props.streakData }
					max={ this.props.max }
				/>
			);
			weekStart.add( 1, 'week' );
		} while ( weekStart.isBefore( monthEnd, 'day' ) || weekStart.isSame( monthEnd, 'day' ) );

		return weeks;
	}

	render() {
		return (
			<div className="post-trends__month">
				<div key="weeks" className="post-trends__weeks">
					{ this.getWeekComponents() }
				</div>
				<div key="label" className="post-trends__label">
					{ this.props.startDate.format( 'MMM' ) }
				</div>
			</div>
		);
	}
}

export default localize( withLocalizedMoment( PostTrendsMonth ) );
