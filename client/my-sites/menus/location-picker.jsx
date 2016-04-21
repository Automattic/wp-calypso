/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:menus:location-picker' ); // eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' );

var LocationPicker = React.createClass({

	selectLocation: function( event ) {
		var locationName = event.target.value;
		analytics.ga.recordEvent( 'Menus', 'Selected Menu Area', 'Area', locationName );
		this.props.selectHandler( locationName );
	},

	recordClick: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Menu Area Dropdown' );
	},

	render: function() {
		var locations, title;

		locations = this.props.locations.map( function( location ) {
			return <option key={ location.name } value={ location.name }>{ location.description }</option>;
		} );

		title = this.translate(
				'%(numberOfLocations)s menu area on this site',
				'%(numberOfLocations)s menu areas on this site',
				{
					count: locations.length,
					args: {
						numberOfLocations: locations.length
					}
				}
		);

		return (
			<div className="menus__picker is-location">
				<label htmlFor="location-picker-select">{ title }</label>
				<select onChange={ this.selectLocation }
						onClick={ this.recordClick }
						value={ this.props.selectedLocation }
						id="location-picker-select">
					{ locations }
				</select>
			</div>
		);
	}
});

module.exports = LocationPicker;
