/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var notices = require( 'notices' ),
	upgradesActions = require( 'lib/upgrades/actions' );

function createContainer( DecoratedComponent ) {
	return React.createClass( {
		propTypes: {
			selectedDomainName: React.PropTypes.string.isRequired
		},

		render() {
			return (
				<DecoratedComponent { ...this.props } { ...this.state }
					handleSubmit={ this.handleSubmit } />
			);
		},

		getInitialState: function() {
			return { submitting: false };
		},

		handleSubmit: function( event ) {
			event.preventDefault();

			this.setState( { submitting: true } );

			upgradesActions.resendIcannVerification( this.props.selectedDomainName, ( error ) => {
				if ( error ) {
					notices.error( error.message );
				} else {
					notices.info( this.translate(
						'Verification sent to [registrant contact email]. Check your email.'
					) );
				}

				this.setState( { submitting: false } );
			} );
		}
	} );
}

const Button = React.createClass( {
	propTypes: {
		submitting: React.PropTypes.bool.isRequired,
		onClick: React.PropTypes.func.isRequired
	},

	render() {
		return (
			<button disabled={ this.props.submitting }
					className="button is-primary is-full-width"
					onClick={ this.props.onClick }>
				{ this.translate( 'Resend verification email' ) }
			</button>
		);
	}
} );

export default {
	createContainer,
	Button
};
