/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
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
		const { signupDependencies, step, stepSectionName, translate } = this.props;

		const content = (
			<div className="emails__register-email-step">
				<CalypsoShoppingCartProvider>
					<EmailSignupTitanCard
						siteUrl={ signupDependencies.domainItem?.meta }
						//TODO
						addButtonTitle={ translate( 'Add' ) }
						skipButtonTitle={ translate( 'Skip' ) }
						onAddButtonClick={ () => {} }
						onSkipButtonClick={ () => {} }
					/>
				</CalypsoShoppingCartProvider>
			</div>
		);

		const sideContent = this.renderSideContent();

		return (
			<div className="emails__email-suggestion-content-container">
				<div
					key={ step + stepSectionName }
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
		const domainName = this.props.progress.domains.siteUrl;
		const subHeaderText = translate(
			'Add a custom email address to start sending and receiving emails from {{strong}}%(domainName)s{{/strong}} today.',
			{
				args: { domainName },
				components: { strong: <strong /> },
				comment: '%(domainName)s is a domain name chosen by the user',
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

export default connect( ( state ) => {
	const signupDependencies = getSignupDependencyStore( state );
	return {
		signupDependencies,
	};
} )( localize( EmailsStep ) );
