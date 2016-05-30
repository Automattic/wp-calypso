/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/omit' );

module.exports = React.createClass( {

	displayName: 'FormCheckbox',

	render: function() {
		var otherProps = omit( this.props, [ 'className', 'type' ] );

		return (
			<input { ...otherProps } type="checkbox" className={ classnames( this.props.className, 'form-checkbox' ) } />
		);
	}
} );
