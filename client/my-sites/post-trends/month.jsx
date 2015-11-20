/**
 * External dependencies
 */
var React = require( 'react/addons' );

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' ),
	Week = require( './week' );

module.exports = React.createClass( {

	displayName: 'PostTrendsMonth',

	propTypes: {
		startDate: React.PropTypes.object.isRequired,
		data: React.PropTypes.object.isRequired
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
			weeks.push( <Week key={ weekStart.format( 'YYYYMMDD' ) } startDate={ i18n.moment( weekStart ) } month={ monthStart } data={ this.props.data } /> );
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
