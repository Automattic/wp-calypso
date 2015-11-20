/**
 * External dependencies
 */
var React = require( 'react/addons' );

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' ),
	Day = require( './day' );

module.exports = React.createClass( {

	displayName: 'PostTrendsWeek',

	propTypes: {
		startDate: React.PropTypes.object.isRequired,
		month: React.PropTypes.object.isRequired,
		data: React.PropTypes.object.isRequired
	},

	getDayComponents: function() {
		var i,
			data = this.props.data.response.days || {},
			max = this.props.data.response.max || 1,
			days = [],
			dayDate;

		for ( i = 0; i < 7; i++ ) {
			dayDate = i18n.moment( this.props.startDate ).add( i, 'day' );
			days.push( <Day days={ data } key={ dayDate.format( 'MMDD' ) } date={ dayDate } month={ this.props.month } max={ max } /> );
		}

		return days;
	},

	render: function() {
		return (
			<div className="post-trends__week">{ this.getDayComponents() }</div>
		);
	}

} );
