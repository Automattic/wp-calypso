/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:module-chart:label' );

/**
 * Internal dependencies
 */
var user = require( 'lib/user' )();

module.exports = React.createClass( {
	displayName: 'ModuleChartLabel',

	propTypes: {
		width: React.PropTypes.number.isRequired,
		x: React.PropTypes.number.isRequired,
		label: React.PropTypes.string.isRequired
	},

	render: function() {
		debug( 'Rendering label' );

		var labelStyle,
			dir = user.isRTL() ? 'right' : 'left';

		labelStyle = {
			width: this.props.width + 'px'
		};

		labelStyle[ dir ] = this.props.x + 'px';

		return <div className="chart__x-axis-label" style={ labelStyle }>{ this.props.label }</div>;
	}
} );