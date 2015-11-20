/**
 * External dependencies
 */
var React = require( 'react' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormSectionHeading',

	render: function() {
		return (
			<h3 { ...omit( this.props, 'className' ) } className={ joinClasses( this.props.className, 'form-section-heading' ) } >
				{ this.props.children }
			</h3>
		);
	}
} );
