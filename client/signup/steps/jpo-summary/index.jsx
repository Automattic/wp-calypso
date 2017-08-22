/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import get from 'lodash/get';
import page from 'page';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Button from 'components/button';
import { translate } from 'i18n-calypso';
import { setJPOSummary } from 'state/signup/steps/jpo-summary/actions';

class JPOSummaryStep extends React.Component {

	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOSummary: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string
	};

	constructor( props ) {
		super( props );
		this.getFormattedPayload = this.getFormattedPayload.bind( this );
		this.completeOnboarding = this.completeOnboarding.bind( this );
		this.renderStepContent = this.renderStepContent.bind( this );
	}

	getFormattedPayload() {
		const payload = this.props.signupProgress;
		return {
			siteTitle: get( payload[ 0 ], [ 'jpoSiteTitle', 'siteTitle' ], '' ),
			siteDescription: get( payload[ 0 ], [ 'jpoSiteTitle', 'siteDescription' ], '' ),
			businessPersonal: get( payload[ 1 ], [ 'jpoSiteType', 'businessPersonal' ], '' ),
			genre: get( payload[ 1 ], [ 'jpoSiteType', 'genre' ], '' ),
			businessName: get( payload[ 1 ], [ 'jpoSiteType', 'addressInfo', 'businessName' ], '' ),
			businessAddress: get( payload[ 1 ], [ 'jpoSiteType', 'addressInfo', 'streetAddress' ], '' ),
			businessCity: get( payload[ 1 ], [ 'jpoSiteType', 'addressInfo', 'city' ], '' ),
			businessState: get( payload[ 1 ], [ 'jpoSiteType', 'addressInfo', 'state' ], '' ),
			businessZipCode: get( payload[ 1 ], [ 'jpoSiteType', 'addressInfo', 'zipCode' ], '' ),
			homepageFormat: get( payload[ 2 ], 'jpoHomepage', '' ),
			addContactForm: get( payload[ 3 ], 'jpoContactForm', '' )
		};
	}

	completeOnboarding() {
		// Get the payload and original JPC url
		const payload = this.getFormattedPayload();
		const jetpackConnectUrl = localStorage.getItem( 'jpoConnectUrl' );

		// Flag the flow as complete for use in JPC
		localStorage.setItem( 'jpoFlowComplete', '1' );

		// Store the payload in localStorage for use after Jetpack is connected
		localStorage.setItem( 'jpoPayload', JSON.stringify( payload ) );

		// Redirect to the original JPC URL
		page.redirect( jetpackConnectUrl );
	}

	renderStepContent() {
		const connectionToJetpackComplete = true;

		const checkMark = <Gridicon
			className="jpo-summary__item-checkmark"
			size={ 12 }
			icon="checkmark"
			/>;

		const {
			signupProgress: {
				0: {
					jpoSiteTitle
				},
				1: {
					jpoSiteType
				},
				2: {
					jpoHomepage
				},
				3: {
					jpoContactForm
				}
			}
		} = this.props;

		const pathPrefix = '/start/jetpack-onboarding/';

		return (
			<div className="jpo__summary-wrapper">
				<table>
					<tbody>
						<tr>
							<td>
								<div className="jpo__summary-col-header jpo-summary__col-header">
									{
										translate( "Steps you've completed:" )
									}
								</div>
								<ul className="jpo-summary__completed-onboarding">
									{
										jpoSiteTitle
											? <li>{ checkMark } <span>{ translate( 'Site Title & Description' ) }</span></li>
											: null
									}
									{
										jpoSiteType
											? <li>{ checkMark } <span>{ translate( 'Type of Site' ) }</span></li>
											: null
									}
									{
										jpoHomepage
											? <li>{ checkMark } <span>{ translate( 'Type of Homepage' ) }</span></li>
											: null
									}
									{
										jpoContactForm
											? <li>{ checkMark } <span>{ translate( 'Contact Us Form' ) }</span></li>
											: null
									}
									{
										connectionToJetpackComplete
											? <li>{ checkMark } <span>{ translate( 'Jetpack Connection' ) }</span></li>
											: null
									}
								</ul>
							</td>
							<td>
								<div className="jpo__summary-col-header jpo-summary__col-header">
									{
										translate( 'Continue your site setup:' )
									}
								</div>
								<ul className="jpo-summary__more-onboarding">
									{
										jpoSiteTitle
											? null
											: <li><a href={ `${ pathPrefix }jpo-site-title` }>{ translate( 'Site Title & Description' ) }</a></li>
									}
									{
										jpoSiteType
											? null
											: <li><a href={ `${ pathPrefix }jpo-site-type` }>{ translate( 'Type of Site' ) }</a></li>
									}
									{
										jpoHomepage
											? null
											: <li><a href={ `${ pathPrefix }jpo-homepage` }>{ translate( 'Type of Homepage' ) }</a></li>
									}
									{
										jpoContactForm
											? null
											: <li><a href={ `${ pathPrefix }jpo-contact-form` }>{ translate( 'Contact Us Form' ) }</a></li>
									}
									{ ! connectionToJetpackComplete ? <li>{ translate( 'Jetpack Connection' ) }</li> : null }
									<li><a href="#">{ translate( 'Choose a Theme' ) }</a></li>
									<li><a href="#">{ translate( 'Add a Site Address' ) }</a></li>
									<li><a href="#">{ translate( 'Add a Store' ) }</a></li>
									<li><a href="#">{ translate( 'Start a Blog' ) }</a></li>
								</ul>
							</td>
						</tr>
					</tbody>
				</table>
				<div>
					<Button primary onClick={ this.completeOnboarding }>
						{
							translate( 'Visit your site' )
						}
					</Button>
				</div>
			</div>
		);
	}

	render() {
		const headerText = translate( 'Congratulations! %s is on its way.', {
			args: get( this.props.signupProgress[ 0 ], [ 'jpoSiteTitle', 'siteTitle' ], false ) || translate( 'your new site' )
		} );
		const subHeaderText = translate(
			'You have unlocked dozens of website-bolstering features with Jetpack. Continue preparing your site below.'
		);

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
					goToNextStep={ false }
				/>
			</div>
		);
	}
}

export default connect(
	null,
	{ setJPOSummary }
)( JPOSummaryStep );
