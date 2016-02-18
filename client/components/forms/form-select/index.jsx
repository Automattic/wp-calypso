/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/omit' );

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
