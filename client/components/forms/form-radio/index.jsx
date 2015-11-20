/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormRadio',

	render: function() {
		var otherProps = omit( this.props, [ 'className', 'type' ] );

		return (
			<input
				{ ...otherProps }
				type="radio"
				className={ joinClasses( this.props.className, 'form-radio' ) } />
		);
	}
} );
