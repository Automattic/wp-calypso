/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/omit' );

module.exports = React.createClass( {

	displayName: 'FormSectionHeading',

	render: function() {
		return (
			<h3 { ...omit( this.props, 'className' ) } className={ classnames( this.props.className, 'form-section-heading' ) } >
				{ this.props.children }
			</h3>
		);
	}
} );
