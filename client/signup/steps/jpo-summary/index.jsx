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

<<<<<<< HEAD
	doJetpackConnect() {
		if ( 'undefined' !== typeof( Storage ) && localStorage.getItem( 'jetpackConnectUrl' ) ) {
			const connectUrl = localStorage.getItem( 'jetpackConnectUrl' );

			localStorage.removeItem( 'jetpackConnectUrl' );
			
			localStorage.setItem( 'jetpackOnboardingPayload', JSON.stringify( this.props.signupProgress ) );

			document.location.href = connectUrl.replace( '&onboarding=1', '' );
		}
	},

=======
>>>>>>> 374e2ba4bd84992dc5aa4e56e820f0da4e00c81a
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
								<ul>
									{ 'undefined' !== typeof this.props.signupProgress[0].jpoSiteTitle ? <li>{ checkMark } { translate( 'Site Title & Description' ) }</li> : null }
									{ 'undefined' !== typeof this.props.signupProgress[1].jpoSiteType ? <li>{ checkMark } { translate( 'Type of Site' ) }</li> : null }
									{ 'undefined' !== typeof this.props.signupProgress[2].jpoHomepage ? <li>{ checkMark } { translate( 'Type of Homepage' ) }</li> : null }
									{ 'undefined' !== typeof this.props.signupProgress[3].jpoContactForm ? <li>{ checkMark } { translate( 'Contact Us Form' ) }</li> : null }
									{ connectionToJetpackComplete ? <li>{ checkMark } { translate( 'Connection to Jetpack' ) }</li> : null }
								</ul>
							</td>
							<td>
								<div className="jpo__summary-col-header">Configure more of your site:</div>
								<ul>
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
<<<<<<< HEAD
					<Button primary onClick={ this.doJetpackConnect }>Complete Onboarding</Button>
=======
					<Button primary>Complete Onboarding</Button>
>>>>>>> 374e2ba4bd84992dc5aa4e56e820f0da4e00c81a
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