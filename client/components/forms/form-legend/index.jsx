/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/omit' );

module.exports = React.createClass( {

	displayName: 'FormLegend',

	render: function() {
		return (
			<legend { ...omit( this.props, 'className' ) } className={ classnames( this.props.className, 'form-legend' ) } >
				{ this.props.children }
			</legend>
		);
	}
} );
