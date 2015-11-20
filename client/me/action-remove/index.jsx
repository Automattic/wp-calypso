/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {

	displayName: 'ActionRemove',

	getDefaultProps: function() {
		return {
			isSubmitting: false,
			isPrimary: true
		};
	},

	render: function() {
		var buttonClasses = classNames( {
			'action-remove': true
		} );

		return (
			<button
				title={ this.translate( 'Remove', { textOnly: true } ) }
				{ ...omit( this.props, 'className' ) }
				className={ joinClasses( this.props.className, buttonClasses ) } >
				{ this.props.children }
			</button>
		);
	}
} );
