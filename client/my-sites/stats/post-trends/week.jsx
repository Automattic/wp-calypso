/**
 * External dependencies
 */
var i18n = require( 'i18n-calypso' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var Day = require( './day' );

module.exports = React.createClass( {

	displayName: 'PostTrendsWeek',

	propTypes: {
		startDate: React.PropTypes.object.isRequired,
		month: React.PropTypes.object.isRequired
	},

	getDayComponents: function() {
		var i,
			days = [],
			dayDate;

		for ( i = 0; i < 7; i++ ) {
			dayDate = i18n.moment( this.props.startDate ).add( i, 'day' );
			days.push( <Day key={ dayDate.format( 'MMDD' ) } date={ dayDate } month={ this.props.month } /> );
		}

		return days;
	},

	render: function() {
		return (
			<div className="post-trends__week">{ this.getDayComponents() }</div>
		);
	}

} );
