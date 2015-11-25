/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormRadio',

	render: function() {
		var otherProps = omit( this.props, [ 'className', 'type' ] );

		return (
			<input
				{ ...otherProps }
				type="radio"
				className={ classnames( this.props.className, 'form-radio' ) } />
		);
	}
} );
