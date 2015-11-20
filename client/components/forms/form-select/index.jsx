/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormSelect',

	render: function() {
		return (
			<select { ...omit( this.props, 'classname' ) } className={ joinClasses( this.props.className, 'form-select' ) } >
				{ this.props.children }
			</select>
		);
	}
} );
