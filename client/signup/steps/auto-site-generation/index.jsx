import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmailSignupTitanCard from 'calypso/components/emails/email-signup-titan-card';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import './style.scss';

class AutoSiteGeneration extends Component {
	componentDidMount() {
		// Do awesome site generation stuff here
	}

	handleSkip = () => {
		const { flowName, stepName } = this.props;

		this.props.recordTracksEvent( 'calypso_signup_skip_step', {
			section: 'signup',
			flow: flowName,
			step: stepName,
		} );

		// Handle goToNextStep stuff here
	};

	renderStepContent() {
		const { hideSkip, signupDependencies, step, stepSectionName, translate } = this.props;

		// Replace content with whatever is decided upon by the design team
		return (
			<div className="emails__email-suggestion-content-container">
				<div
					key={ step + stepSectionName }
					className="emails__step-content emails__step-content-email-step"
				>
					<div className="emails__register-email-step">
						<CalypsoShoppingCartProvider>
							<EmailSignupTitanCard
								siteUrl={ signupDependencies.domainItem?.meta }
								addButtonTitle={ translate( 'Add' ) }
								skipButtonTitle={ translate( 'Skip' ) }
								hideSkip={ hideSkip }
								// onAddButtonClick={ this.handleAddEmail }
								onSkipButtonClick={ this.handleSkip }
							/>
						</CalypsoShoppingCartProvider>
					</div>
				</div>
			</div>
		);
	}

	render() {
		const {
			backUrl = '/',
			flowName,
			hideSkip = false,
			positionInFlow,
			stepName,
			translate,
		} = this.props;

		const headerText = translate( 'Generating your free site' );
		const subHeaderText = translate( 'Free site auto-generation subheader text' );

		// Audit the props passed to StepWrapper
		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				backUrl={ backUrl }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				subHeaderText={ subHeaderText }
				isExternalBackUrl={ false }
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				stepContent={ this.renderStepContent() }
				allowBackFirstStep={ !! backUrl }
				backLabelText={ translate( 'Back' ) }
				hideSkip={ hideSkip }
				goToNextStep={ this.handleSkip }
				skipHeadingText={ translate( 'Not sure yet?' ) }
				skipLabelText={ translate( 'C' ) }
				skipButtonAlign="bottom"
				align="left"
				isWideLayout={ true }
			/>
		);
	}
}

// Audit the connections
export default connect(
	( state ) => {
		const signupDependencies = getSignupDependencyStore( state );
		return {
			signupDependencies,
		};
	},
	{
		recordTracksEvent,
		saveSignupStep,
		submitSignupStep,
	}
)( localize( AutoSiteGeneration ) );
