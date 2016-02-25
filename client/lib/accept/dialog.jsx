/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Dialog = require( 'components/dialog' );

module.exports = React.createClass( {
	displayName: 'AcceptDialog',

	propTypes: {
		// message can either be a string, an element or an array of string/elements (returned by `this.translate`)
		message: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.element,
			React.PropTypes.array,
		] ).isRequired,
		onClose: React.PropTypes.func.isRequired,
		confirmButtonText: React.PropTypes.string,
		cancelButtonText: React.PropTypes.string,
	},

	getInitialState: function() {
		return { isVisible: true };
	},

	onClose: function( action ) {
		this.props.onClose( 'accept' === action );

		if ( this.isMounted() ) {
			this.setState( { isVisible: false } );
		}
	},

	getActionButtons: function() {
		return [
			{
				action: 'cancel',
				label: this.props.cancelButtonText ? this.props.cancelButtonText : this.translate( 'Cancel' ),
			},
			{
				action: 'accept',
				label: this.props.confirmButtonText ? this.props.confirmButtonText : this.translate( 'OK' ),
				isPrimary: true
			}
		];
	},

	render: function() {
		if ( ! this.state.isVisible ) {
			return null;
		}

		return (
			<Dialog
				buttons={ this.getActionButtons() }
				onClose={ this.onClose }
				className="accept-dialog"
				isVisible>
				{ this.props.message }
			</Dialog>
		);
	}
} );
