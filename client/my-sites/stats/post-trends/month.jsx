/**
 * External dependencies
 */
var i18n = require( 'i18n-calypso' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var Week = require( './week' );

module.exports = React.createClass( {

	displayName: 'PostTrendsMonth',

	propTypes: {
		startDate: React.PropTypes.object.isRequired,
		streakData: React.PropTypes.object,
		max: React.PropTypes.number
	},

	getWeekComponents: function() {
		var monthStart = i18n.moment( this.props.startDate ),
			monthEnd = i18n.moment( monthStart ).endOf( 'month' ),
			weekStart = i18n.moment( monthStart ).startOf( 'week' ),
			weeks = [];

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
					startDate={ i18n.moment( weekStart ) }
					month={ monthStart }
					streakData={ this.props.streakData }
					max={ this.props.max }
				/>
			);
			weekStart.add( 1, 'week' );
		} while ( weekStart.isBefore( monthEnd, 'day' ) || weekStart.isSame( monthEnd, 'day' ) );

		return weeks;
	},

	render: function() {
		return (
			<div className="post-trends__month">
				<div key="weeks" className="post-trends__weeks">{ this.getWeekComponents() }</div>
				<div key="label" className="post-trends__label">{ this.props.startDate.format( 'MMM' ) }</div>
			</div>
		);
	}

} );
