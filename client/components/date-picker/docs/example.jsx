/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	DatePicker = require( 'components/date-picker' );

/**
 * Date Picker Demo
 */
var datePicker = React.createClass( {
	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		var date = new Date();
		date.setDate( date.getDate() + 3 );
		date.setMilliseconds( 0 );
		date.setSeconds( 0 );
		date.setMinutes( 0 );
		date.setHours( 0 );

		return {
			events: [
				{
					title: '1 other post scheduled',
					date: new Date( '2015-07-15 10:30' ),
					type: 'scheduled'
				},
				{
					title: 'Happy birthday Damian',
					date: new Date( '2015-07-18 15:00' ),
					type: 'birthday'
				},
				{
					title: 'Do not rest',
					date: new Date( '2015-07-18 8:00' )
				}
			],
			selectedDay: this.moment( date )
		};
	},

	selectDay: function( date, modifiers ) {
		this.setState( { selectedDay: date } );

		if ( date ) {
			console.log( date.toDate(), modifiers );
		}
	},

	render: function() {
		return (
			<Card style={ { width: '300px', margin: 0 } }>
				<DatePicker
					events={ this.state.events }
					onSelectDay={ this.selectDay }
					selectedDay={ this.state.selectedDay }>
				</DatePicker>
			</Card>
		);
	}
} );

module.exports = datePicker;
