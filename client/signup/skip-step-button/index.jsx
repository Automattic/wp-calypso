/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var SignupActions = require( 'lib/signup/actions' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {
	displayName: 'SkipStepButton',

	handleSubmit: function() {
		analytics.tracks.recordEvent( 'calypso_signup_skip_step', { step: this.props.stepName } );

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], this.props.defaultDependencies );

		this.props.goToNextStep();
	},

	render: function() {
		return (
			<button className="button skip-step" onClick={ this.handleSubmit }>
				{ this.translate( 'Skip' ) }
			</button>
		);
	}
} );
