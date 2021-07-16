/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import EmailStepSideBar from 'calypso/components/emails/email-step-side-bar';
import EmailSignupTitanCard from 'calypso/components/emails/email-signup-titan-card';
import StepWrapper from 'calypso/signup/step-wrapper';

/**
 * Style dependencies
 */
import './style.scss';

class EmailsStep extends React.Component {
	//TODO
	handleSkip = () => {};

	renderSideContent = () => {
		return (
			<div className="emails__email-side-content-container">
				<div className="emails__email-side-content">
					<EmailStepSideBar />
				</div>
			</div>
		);
	};

	renderContent() {
		const content = (
			<div className="register-email-step">
				<CalypsoShoppingCartProvider>
					<EmailSignupTitanCard
						siteUrl={ this.props.progress.domains.siteUrl }
						//TODO
						addButtonTitle={ this.props.translate( 'Add' ) }
						skipButtonTitle={ this.props.translate( 'Skip' ) }
						onAddButtonClick={ () => {} }
						onSkipButtonClick={ () => {} }
						//TODO
						price={ '3.5$' }
					/>
				</CalypsoShoppingCartProvider>
			</div>
		);
		const sideContent = this.renderSideContent();

		return (
			<div className="emails__email-suggestion-content-container">
				<div
					key={ this.props.step + this.props.stepSectionName }
					className="emails__step-content emails__step-content-email-step"
				>
					{ content }
					{ sideContent }
				</div>
			</div>
		);
	}

	render() {
		const { flowName, translate, stepName, positionInFlow } = this.props;
		const backUrl = 'start/domains/';
		const headerText = translate( 'Add Professional Email' );
		const url = this.props.progress.domains.siteUrl;
		const subHeaderText = translate(
			`Add a custom email address to start sending and receiving emails from {{b}}${ url }{{/b}} today.`,
			{
				components: { b: <strong /> },
			}
		);
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
				stepContent={ this.renderContent() }
				showSiteMockups={ false }
				allowBackFirstStep={ !! backUrl }
				backLabelText={ translate( 'Back' ) }
				hideSkip={ false }
				isTopButtons={ false }
				goToNextStep={ this.handleSkip }
				skipHeadingText={ translate( 'Not sure yet?' ) }
				skipLabelText={ translate( 'Buy an email later' ) }
				align={ 'left' }
				isWideLayout={ true }
			/>
		);
	}
}

export default localize( EmailsStep );
