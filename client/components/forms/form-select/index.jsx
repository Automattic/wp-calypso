/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormSelect',

	render: function() {
		return (
			<select { ...omit( this.props, 'classname' ) } className={ classnames( this.props.className, 'form-select' ) } >
				{ this.props.children }
			</select>
		);
	}
} );
