/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormTextarea',

	render: function() {
		return (
			<textarea { ...omit( this.props, 'className' ) } className={ joinClasses( this.props.className, 'form-textarea' ) } >
				{ this.props.children }
			</textarea>
		);
	}
} );
