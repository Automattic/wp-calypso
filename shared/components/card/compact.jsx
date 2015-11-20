/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	assign = require( 'lodash/object/assign' ),
	joinClasses = require( 'react/lib/joinClasses' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' );

module.exports = React.createClass( {
	displayName: 'CompactCard',

	render: function() {
		const props = assign( {}, this.props, { className: joinClasses( this.props.className, 'is-compact' ) } );

		return (
			<Card { ...props }>
				{ this.props.children }
			</Card>
		);
	}
} );
