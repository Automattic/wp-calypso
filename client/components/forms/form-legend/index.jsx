/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormLegend',

	render: function() {
		return (
			<legend { ...omit( this.props, 'className' ) } className={ joinClasses( this.props.className, 'form-legend' ) } >
				{ this.props.children }
			</legend>
		);
	}
} );
