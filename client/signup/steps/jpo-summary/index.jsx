/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Button from 'components/button';
import { translate } from 'i18n-calypso';
import { setJPOSummary } from 'state/signup/steps/jpo-summary/actions';

const JPOSummaryStep = React.createClass( {
	propTypes: {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOSummary: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	},

	getFormattedPayload() {
		let payload = this.props.signupProgress;
		
		let formattedPayload = {
			siteTitle: payload[0].jpoSiteTitle.siteTitle,
			siteDescription: payload[0].jpoSiteTitle.siteDescription,
			businessPersonal: payload[1].jpoSiteType.businessPersonal,
			genre: payload[1].jpoSiteType.genre,
			businessName: payload[1].jpoSiteType.addressInfo.businessName,
			businessAddress: payload[1].jpoSiteType.addressInfo.streetAddress,
			businessCity: payload[1].jpoSiteType.addressInfo.city,
			businessState: payload[1].jpoSiteType.addressInfo.state,
			businessZipCode: payload[1].jpoSiteType.addressInfo.zipCode,
			homepageFormat: payload[2].jpoHomepage,
			addContactForm: payload[3].jpoContactForm
		};

		return formattedPayload;
	},

	completeOnboarding() {
		// Get the payload and original JPC url
		const payload = this.getFormattedPayload();
		const jetpackConnectUrl = localStorage.getItem( 'jpoConnectUrl' );

		// Flag the flow as complete for use in JPC
		localStorage.setItem( 'jpoFlowComplete', '1' );

		/**
		 * Store the payload in localStorage for use after the connection
		 * to Jetpack has been authorized
		 */
		localStorage.setItem( 'jpoPayload', JSON.stringify( payload ) );

		// Redirect to the original JPC URL
		window.location.href = jetpackConnectUrl;
	},

	goToStepOne() {
		this.props.goToStep( 1 );
	},

	goToStepTwo() {
		this.props.goToStep( 2 );
	},

	goToStepThree() {
		this.props.goToStep( 3 );
	},

	goToStepFour() {
		this.props.goToStep( 4 );
	},

	skipStep() {
		this.props.goToNextStep();
	},

	renderStepContent() {
		const connectionToJetpackComplete = true;

		const checkMark = <Gridicon
			className="plan-features__item-checkmark"
			size={ 18 } icon="checkmark" />;

		return (
			<div className="jpo__summary-wrapper">
				<table>
					<tbody>
						<tr>
							<td>
								<div className="jpo__summary-col-header">Steps you've completed:</div>
								<ul className="jpo-summary__completed-onboarding">
									{ 'undefined' !== typeof this.props.signupProgress[0].jpoSiteTitle ? <li>{ checkMark } { translate( 'Site Title & Description' ) }</li> : null }
									{ 'undefined' !== typeof this.props.signupProgress[1].jpoSiteType ? <li>{ checkMark } { translate( 'Type of Site' ) }</li> : null }
									{ 'undefined' !== typeof this.props.signupProgress[2].jpoHomepage ? <li>{ checkMark } { translate( 'Type of Homepage' ) }</li> : null }
									{ 'undefined' !== typeof this.props.signupProgress[3].jpoContactForm ? <li>{ checkMark } { translate( 'Contact Us Form' ) }</li> : null }
									{ connectionToJetpackComplete ? <li>{ checkMark } { translate( 'Connection to Jetpack' ) }</li> : null }
								</ul>
							</td>
							<td>
								<div className="jpo__summary-col-header">Configure more of your site:</div>
								<ul className="jpo-summary__more-onboarding">
									{ 'undefined' === typeof this.props.signupProgress[0].jpoSiteTitle ? <li onClick={ this.goToStepOne }>{ translate( 'Site Title & Description' ) }</li> : null }
									{ 'undefined' === typeof this.props.signupProgress[1].jpoSiteType ? <li onClick={ this.goToStepTwo }>{ translate( 'Type of Site' ) }</li> : null }
									{ 'undefined' === typeof this.props.signupProgress[2].jpoHomepage ? <li onClick={ this.goToStepThree }>{ translate( 'Type of Homepage' ) }</li> : null }
									{ 'undefined' === typeof this.props.signupProgress[3].jpoContactForm ? <li onClick={ this.goToStepFour }>{ translate( 'Contact Us Form' ) }</li> : null }
									{ ! connectionToJetpackComplete ? <li>{ translate( 'Connection to Jetpack' ) }</li> : null }
									<li>{ translate( 'Choose a Theme' ) }</li>
									<li>{ translate( 'Add a Site Address' ) }</li>
									<li>{ translate( 'Add a Store' ) }</li>
									<li>{ translate( 'Start a Blog' ) }</li>
								</ul>
							</td>
						</tr>
					</tbody>
				</table>
				<div>
					<Button primary onClick={ this.completeOnboarding }>Complete Onboarding</Button>
				</div>
			</div>
		);
	},

	render() {
		let siteTitle = ( 'undefined' !== typeof this.props.signupProgress[0].jpoSiteTitle )
			? this.props.signupProgress[0].jpoSiteTitle.siteTitle
			: translate( 'your new site' );

		const headerText = translate( 'Congratulations! ' ) + siteTitle + translate( ' is on its way.' );
		const subHeaderText = translate( 'You enabled Jetpack and unlocked dozens of website-bolstering features. Continue preparing yoru site below.' );

		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderStepContent() }
					goToNextStep={ this.skipStep }
				/>
			</div>
		);
	}
} );

export default connect(
	null,
	{ setJPOSummary }
)( JPOSummaryStep );