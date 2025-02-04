import { localize } from 'i18n-calypso';
import { defer } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmailSignupTitanCard from 'calypso/components/emails/email-signup-titan-card';
import EmailStepSideBar from 'calypso/components/emails/email-step-side-bar';
import { titanMailYearly } from 'calypso/lib/cart-values/cart-items';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import './style.scss';

class EmailsStep extends Component {
	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	handleAddEmail = () => {
		const { flowName, signupDependencies, stepName } = this.props;
		const { domainItem } = signupDependencies;

		const emailItem = domainItem?.meta
			? titanMailYearly( {
					domain: domainItem.meta,
					quantity: 1,
					extra: {
						new_quantity: 1,
					},
			  } )
			: undefined;

		// It may be cleaner to call handleSkip() if emailItem is undefined.
		this.props.recordTracksEvent( 'calypso_signup_email_add', {
			domain: domainItem?.meta,
			domain_slug: domainItem?.product_slug,
			flow: flowName,
			product_slug: emailItem?.product_slug,
			step: stepName,
		} );

		this.submitEmailPurchase( emailItem );
	};

	handleSkip = () => {
		const { flowName, stepName } = this.props;

		this.props.recordTracksEvent( 'calypso_signup_skip_step', {
			section: 'signup',
			flow: flowName,
			step: stepName,
		} );

		this.submitEmailPurchase( undefined );
	};

	submitEmailPurchase = ( emailItem ) => {
		defer( () => {
			const { goToNextStep, stepName, stepSectionName } = this.props;

			this.props.submitSignupStep(
				{
					emailItem,
					stepName,
					stepSectionName,
				},
				{
					emailItem,
				}
			);

			goToNextStep();
		} );
	};

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
		const { hideSkip, signupDependencies, step, stepSectionName, translate } = this.props;

		const content = (
			<div className="emails__register-email-step">
				<CalypsoShoppingCartProvider>
					<EmailSignupTitanCard
						siteUrl={ signupDependencies.domainItem?.meta }
						addButtonTitle={ translate( 'Add' ) }
						skipButtonTitle={ translate( 'Skip' ) }
						hideSkip={ hideSkip }
						onAddButtonClick={ this.handleAddEmail }
						onSkipButtonClick={ this.handleSkip }
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
		const {
			backUrl = 'domains/',
			flowName,
			hideSkip = false,
			positionInFlow,
			signupDependencies,
			stepName,
			translate,
		} = this.props;
		const headerText = translate( 'Add Professional Email' );
		const domainName = signupDependencies.domainItem?.meta;
		const subHeaderText = translate(
			'Add a custom email address to start sending and receiving emails from {{strong}}%(domainName)s{{/strong}} today.',
			{
				args: { domainName },
				components: { strong: <strong className="emails__register-email-step--domain-name" /> },
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
				allowBackFirstStep={ !! backUrl }
				backLabelText={ translate( 'Back' ) }
				hideSkip={ hideSkip }
				goToNextStep={ this.handleSkip }
				skipHeadingText={ translate( 'Not sure yet?' ) }
				skipLabelText={ translate( 'Buy an email later' ) }
				skipButtonAlign="bottom"
				align="left"
				isWideLayout
			/>
		);
	}
}

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
)( localize( EmailsStep ) );
