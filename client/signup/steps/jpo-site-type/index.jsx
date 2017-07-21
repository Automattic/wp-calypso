/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { translate } from 'i18n-calypso';
import { getJPOSiteTitle } from 'state/signup/steps/jpo-site-title/selectors';
import { setJPOSiteType } from 'state/signup/steps/jpo-site-type/actions';
import SelectGenre from './select-genre';
import SelectBusinessPersonal from './select-business-personal';
import SelectBusinessAddress from './select-business-address';

const JPOSiteTypeStep = React.createClass( {
	propTypes: {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOSiteType: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	},

	skipStep() {
		this.props.goToNextStep();
	},

	getInitialState() {
		var siteName = getJPOSiteTitle();		

		return {
			headerText: 'Let\'s shape ' + siteName + '.',
			subHeaderText: 'What kind of site do you need? Choose an option below:',
			currentScreen: 'genre',
			siteTypePayload: {
				genre: '',
				businessPersonal: '',
				addressInfo: {
					businessName: '',
					streetAddress: '',
					city: '',
					state: '',
					zipCode: '',
				}
			}
		};
	},

	onSelectBlog() {
		this.setState( { currentScreen: 'businesspersonal' } );
	},

	onSelectWebsite() {
		this.setState( { currentScreen: 'businesspersonal' } );
	},

	onSelectPortfolio() {
		this.setState( { currentScreen: 'businesspersonal' } );
	},

	onSelectStore() {
		this.setState( { currentScreen: 'businesspersonal' } );
	},

	onSelectPersonal() {
		this.onNextStep();
	},

	onSelectBusiness() {
		this.setState( { currentScreen: 'businessaddress' } );
		
		this.state.headerText = 'Add a business address.';
		this.state.subHeaderText = 'Enter your business address to have a map added to your website.';
	},

	onNextStep() {
		this.skipStep();
	},

	renderStepContent() {
		return (
			<div>
				<SelectGenre 
					current={ this.state.currentScreen === 'genre' } 
					onSelectBlog={ this.onSelectBlog }
					onSelectWebsite={ this.onSelectWebsite }
					onSelectPortfolio={ this.onSelectPortfolio }
					onSelectStore={ this.onSelectStore }
				/>
				<SelectBusinessPersonal 
					current={ this.state.currentScreen === 'businesspersonal' } 
					onSelectPersonal={ this.onSelectPersonal }
					onSelectBusiness={ this.onSelectBusiness }
				/>
				<SelectBusinessAddress 
					current={ this.state.currentScreen === 'businessaddress' } 
					onNextStep={ this.onNextStep }
				/>
			</div>
		);
	},

	render() {
		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ this.state.headerText }
					fallbackHeaderText={ this.state.headerText }
					subHeaderText={ this.state.subHeaderText }
					fallbackSubHeaderText={ this.state.subHeaderText }
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
	{ setJPOSiteType }
)( JPOSiteTypeStep );