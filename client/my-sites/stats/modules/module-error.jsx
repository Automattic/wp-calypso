/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'StatModuleError',

	render: function() {
		var panelClassOptions = {},
			message = this.props.message || this.translate( "Some stats didn't load in time. Please try again later." );

		panelClassOptions[ this.props.className ] = true;

		return (
			<div className={ classNames( 'module-content-text', 'is-error', panelClassOptions ) }>
				<p>{ message }</p>
			</div>
		);
	}
} );