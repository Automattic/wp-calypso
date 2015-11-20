/**
 * External dependencies
 */
var React = require( 'react' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	classNames = require( 'classnames' ),
	omit = require( 'lodash/object/omit' ),
	isEmpty = require( 'lodash/lang/isEmpty' );

/**
 * Internal dependencies
 */
var Button = require( 'components/button' );

module.exports = React.createClass( {

	displayName: 'FormsButton',

	getDefaultProps: function() {
		return {
			isSubmitting: false,
			isPrimary: true,
			type: 'submit'
		};
	},

	getDefaultButtonAction: function() {
		return this.props.isSubmitting ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' );
	},

	render: function() {
		var buttonClasses = classNames( {
			'form-button': true
		} );

		return (
			<Button
				{ ...omit( this.props, 'className' ) }
				primary={ this.props.isPrimary }
				className={ joinClasses( this.props.className, buttonClasses ) }>
				{ isEmpty( this.props.children ) ? this.getDefaultButtonAction() : this.props.children }
			</Button>
		);
	}
} );
