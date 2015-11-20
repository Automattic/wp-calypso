/**
 * External dependencies
 */
var React = require( 'react' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' ),
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
			className={ joinClasses( this.props.className, buttonClasses ) } >
				{ this.props.children }
			</div>
		);
	}
} );
