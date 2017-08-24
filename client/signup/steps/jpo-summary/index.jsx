/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
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
import { updateSettings } from 'state/jetpack/settings/actions';
import { isUpdatingJetpackSettings } from 'state/selectors';

class JPOSummaryStep extends React.Component {

	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOSummary: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.shape( {
			jpoSiteTitle: PropTypes.shape( {
				siteTitle: PropTypes.string,
				siteDescription: PropTypes.string
			} ),
			jpoSiteType: PropTypes.shape( {
				genre: PropTypes.string,
				businessPersonal: PropTypes.string,
				businessName: PropTypes.string,
				businessAddress: PropTypes.string,
				businessCity: PropTypes.string,
				businessState: PropTypes.string,
				businessZipCode: PropTypes.string,
			} ),
			jpoHomepage: PropTypes.string,
			jpoContactForm: PropTypes.bool,
			jpoConnect: PropTypes.object.isRequired
		} ).isRequired,
		isSavingSettings: PropTypes.bool
	};

	constructor( props ) {
		super( props );
		this.state = {
			written: false
		};
		this.getOnboardingChoices = this.getOnboardingChoices.bind( this );
		this.completeOnboarding = this.completeOnboarding.bind( this );
		this.renderStepContent = this.renderStepContent.bind( this );
	}

	getOnboardingChoices() {
		const data = this.props.signupDependencies;
		return {
			onboarding: {
				siteTitle: get( data, [ 'jpoSiteTitle', 'siteTitle' ], '' ),
				siteDescription: get( data, [ 'jpoSiteTitle', 'siteDescription' ], '' ),

				genre: get( data, [ 'jpoSiteType', 'genre' ], '' ),
				businessPersonal: get( data, [ 'jpoSiteType', 'businessPersonal' ], '' ),
				businessInfo: {
					businessName: get( data, [ 'jpoSiteType', 'addressInfo', 'businessName' ], '' ),
					businessAddress: get( data, [ 'jpoSiteType', 'addressInfo', 'streetAddress' ], '' ),
					businessCity: get( data, [ 'jpoSiteType', 'addressInfo', 'city' ], '' ),
					businessState: get( data, [ 'jpoSiteType', 'addressInfo', 'state' ], '' ),
					businessZipCode: get( data, [ 'jpoSiteType', 'addressInfo', 'zipCode' ], '' ),
				},

				homepageFormat: get( data, 'jpoHomepage', '' ),

				addContactForm: get( data, 'jpoContactForm', false )
			}
		};
	}

	completeOnboarding() {
		this.setState( {
			written: true
		} );

		this.props.updateSettings(
			get( this.props.signupDependencies, [ 'jpoConnect', 'queryObject', 'client_id' ], -1 ),
			this.getOnboardingChoices()
		);
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
							this.props.isSavingSettings
								? translate( 'Saving…' )
								: translate( 'Save and finish' )
						}
					</Button>
				</div>
			</div>
		);
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.state.written && ! nextProps.isSavingSettings ) {
			page.redirect( '/jetpack/connect/plans/' + get( this.props.signupDependencies, [ 'jpoConnect', 'siteSlug' ] ) );
			return false;
		}
		return true;
	}

	shouldComponentUpdate( nextProps, nextState ) {
		return nextProps.isSavingSettings && nextState.written;
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
					shouldHideNavButtons={ true }
				/>
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = parseInt( get( state.signup.dependencyStore, [ 'jpoConnect', 'queryObject', 'client_id' ], -1 ) );
		return {
			isSavingSettings: isUpdatingJetpackSettings( state, siteId )
		};
	},
	{
		setJPOSummary,
		updateSettings
	}
)( JPOSummaryStep );
