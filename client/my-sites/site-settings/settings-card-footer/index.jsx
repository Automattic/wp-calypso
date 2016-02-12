/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/omit' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {

	displayName: 'SettingsCardFooter',

	render: function() {
		var buttonClasses = classNames( {
			'settings-card-footer': true
		} );

		return (
			<div
				{ ...omit( this.props, 'className' ) }
			className={ classnames( this.props.className, buttonClasses ) } >
				{ this.props.children }
			</div>
		);
	}
} );
