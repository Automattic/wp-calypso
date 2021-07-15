/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import StepWrapper from 'calypso/signup/step-wrapper';
import EmailTitanCard from 'calypso/components/emails/emails-titan-card';
import EmailSideExplainer from 'calypso/components/emails/emails-side-explainer';

/**
 * Style dependencies
 */
import './style.scss';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';

class EmailsStep extends React.Component {
	constructor( props ) {
		super( props );
	}

	getSideContent = () => {
		return (
			<div className="emails__email-side-content-container">
				<div className="emails__email-side-content">
					<EmailSideExplainer />
				</div>
			</div>
		);
	};

	renderContent() {
		const content = (
			<div className="register-email-step">
				<CalypsoShoppingCartProvider>
					<EmailTitanCard
						siteUrl={ this.props.progress.domains.siteUrl }
						addButtonContent={ 'Add' }
						skipButtonContent={ 'Skip' }
						onAddButtonClick={ () => {} }
						onSkipButtonClick={ () => {} }
						price={ '3.5' }
					></EmailTitanCard>
				</CalypsoShoppingCartProvider>
			</div>
		);
		const sideContent = this.getSideContent();

		return (
			<div
				key={ this.props.step + this.props.stepSectionName }
				className="emails__step-content emails__step-content-email-step"
			>
				{ content }
				{ sideContent }
			</div>
		);
	}

	handleSkip = () => {};

	render() {
		const { flowName, translate, stepName, positionInFlow } = this.props;
		const backUrl = '/emails/';
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
				stepContent={ <div>{ this.renderContent() }</div> }
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
