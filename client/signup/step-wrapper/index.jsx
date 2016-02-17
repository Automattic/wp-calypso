/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var StepHeader = require( 'signup/step-header' ),
	NavigationLink = require( 'signup/navigation-link' );

module.exports = React.createClass( {
	displayName: 'StepWrapper',

	renderSkip: function() {
		if ( this.props.goToNextStep ) {
			return (
				<NavigationLink
					direction="forward"
					goToNextStep={ this.props.goToNextStep }
					flowName={ this.props.flowName }
					stepName={ this.props.stepName } />
			);
		}
	},

	headerText: function() {
		if ( this.props.positionInFlow === 0 ) {
			if ( this.props.headerText ) {
				return this.props.headerText;
			}
			return this.translate( 'Let\'s get started.' );
		}

		if ( this.props.fallbackHeaderText ) {
			return this.props.fallbackHeaderText;
		}
	},

	subHeaderText: function() {
		if ( this.props.positionInFlow === 0 ) {
			if ( this.props.subHeaderText ) {
				return this.props.subHeaderText;
			}
			return this.translate( 'Welcome to the best place for your WordPress website.' );
		}

		if ( this.props.fallbackSubHeaderText ) {
			return this.props.fallbackSubHeaderText;
		}
	},

	render: function() {
		return (
			<div className="step-wrapper">
				<StepHeader
					headerText={ this.headerText() }
					subHeaderText={ this.subHeaderText() } />
				<div className="is-animated-content">
					{ this.props.stepContent }
					<div className="step-wrapper__buttons">
						<NavigationLink
							direction="back"
							flowName={ this.props.flowName }
							positionInFlow={ this.props.positionInFlow }
							stepName={ this.props.stepName }
							backUrl={ this.props.backUrl }
							signupProgressStore={ this.props.signupProgressStore } />
						{ this.renderSkip() }
					</div>
				</div>
			</div>
		);
	}
} );
