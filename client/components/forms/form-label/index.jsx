/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormLabel',

	render: function() {
		return (
			<label { ...omit( this.props, 'className' ) } className={ joinClasses( this.props.className, 'form-label' ) } >
				{ this.props.children }
			</label>
		);
	}
} );
