
/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	flatten = require( 'lodash/flatten' ),
	map = require( 'lodash/map' ),
	map = require( 'lodash/map' ),
	find = require( 'lodash/find' ),
	reject = require( 'lodash/reject' ),
	filter = require( 'lodash/filter' ),
	pick = require( 'lodash/pick' ),
	Card = require( 'components/card' ),
	Button = require( 'components/button' ),
	Gridicon = require( 'components/gridicon' );

/**
 * Internal dependencies
 */
var steps = require( 'signup/config/steps' );

/**
 * Sorts the given steps in the roughly the order they will be processed.
 */
function sortSteps( progressSteps ) {
	var canonicalSteps = pick( steps, map( progressSteps, 'stepName' ) ),
		stepWithToken = find( canonicalSteps, { providesToken: true } ) || [],
		stepsWithoutDependencies = reject( canonicalSteps, function( step ) {
			return step.dependencies || step.providesToken;
		} ),
		stepsWithDependencies = filter( canonicalSteps, function( step ) {
			return step.dependencies && ! step.providesToken;
		} );

	return map( flatten( [ stepWithToken, stepsWithoutDependencies, stepsWithDependencies ] ), function( step ) {
		return find( progressSteps, { stepName: step.stepName } );
	} );
}

module.exports = React.createClass( {
	displayName: 'SignupProcessingScreen',

	showStep: function( step, index ) {
		var classes = classNames( {
			'signup__processing': true,
			'is-pending': step.status === 'pending',
			'is-processing': step.status === 'processing',
			'is-complete': step.status === 'completed'
		} );

		if ( ! step.processingMessage ) {
			return null;
		}

		return (
			<div className={ classes } key={ index }>
				{ step.processingMessage }
			</div>
		);
	},

	renderAlreadyConfirmedPrompt: function() {
		return <div>Hello, World</div>;
	},

	renderConfirmationPrompt: function() {
		if ( localStorage.signupProcessingScreen === 'verified' )  {
			return this.renderAlreadyConfirmedPrompt();
		}

		/*if ( this.props.user && this.props.user.email_verified ) {
			return this.renderAlreadyConfirmedPrompt();
		}

		let email = ( this.props.user ? this.props.user.email : this.props.signupDependencies.email );
		if ( !email ) {
			return this.renderAlreadyConfirmedPrompt();
		}*/

		let email = 'foo@bar.com';

		return (
			<div className="signup__email-confirmation">
				<div className="email-confirmation__step">
					<img className="email-confirmation__step-illustration" src="https://cldup.com/HTmwBYXkOL.svg"/>
					<h2 className="email-confirmation__step-title">Check your email</h2>
				</div>

				<Gridicon icon="arrow-right" className="email-confirmation__arrow" />

				<div className="email-confirmation__step">
					<img className="email-confirmation__step-illustration" src="https://cldup.com/QOyStuYoQm.svg"/>
					<h2 className="email-confirmation__step-title">Click the button</h2>
				</div>

				<p className="email-confirmation__reminder">{ this.translate( "We've sent a message to %(email)s. Please use this time to confirm your email address.", { args: { email } } ) }</p>
			</div>
		)
	},

	render: function() {
		return (
			<div>
				<header className="step-header">
					<h1 className="step-header__title">{ this.translate( "We're building your site!" ) }</h1>
					<p className="step-header__subtitle">{ this.translate( "We're getting your site ready. It'll only take a few seconds."  ) }</p>
				</header>

				<Button primary disabled className="email-confirmation__button">{ this.translate( "Just a minute…" ) }</Button>

				{ this.renderConfirmationPrompt() }

				<div className="signup-processing-screen__loader">{ this.translate( 'Loading…' ) }</div>
			</div>
		);
	}
} );
