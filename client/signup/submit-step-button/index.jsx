/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var SignupActions = require( 'lib/signup/actions' );

module.exports = React.createClass( {
	displayName: 'SubmitStepButton',

	handleSubmit: function() {
		SignupActions.submitSignupStep( { stepName: this.props.stepName } );

		this.props.goToNextStep();
	},

	render: function() {
		return (
			<button onClick={ this.handleSubmit } className='button is-primary'>
				{ this.props.buttonText }
			</button>
		);
	}
} );
