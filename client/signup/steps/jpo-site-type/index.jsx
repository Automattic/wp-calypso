/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { translate } from 'i18n-calypso';
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

	getInitialState() {
		return {
			headerText: translate( "Let's shape %s.", {
				args: get( this.props.signupProgress[ 0 ], [ 'jpoSiteTitle', 'siteTitle' ], false ) || translate( 'your new site' )
			} ),
			subHeaderText: translate( 'What kind of site do you need? Choose an option below:' ),
			currentScreen: 'genre',
			payload: {
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
		this.state.payload.genre = 'blog';
		this.setState( { currentScreen: 'businesspersonal' } );
	},

	onSelectWebsite() {
		this.state.payload.genre = 'website';
		this.setState( { currentScreen: 'businesspersonal' } );
	},

	onSelectPortfolio() {
		this.state.payload.genre = 'portfolio';
		this.setState( { currentScreen: 'businesspersonal' } );
	},

	onSelectStore() {
		this.state.payload.genre = 'store';
		this.setState( { currentScreen: 'businesspersonal' } );
	},

	onSelectPersonal() {
		this.state.payload.businessPersonal = 'personal';
		this.submitStep();
	},

	onSelectBusiness() {
		this.state.payload.businessPersonal = 'business';		
		this.state.headerText = 'Add a business address.';
		this.state.subHeaderText = 'Enter your business address to have a map added to your website.';
		this.setState( { currentScreen: 'businessaddress' } );
	},

	onInputBusinessName( event ) {
		this.state.payload.addressInfo.businessName = event.target.value;
	},

	onInputStreetAddress( event ) {
		this.state.payload.addressInfo.streetAddress = event.target.value;
	},

	onInputCity( event ) {
		this.state.payload.addressInfo.city = event.target.value;
	},

	onInputState( event ) {
		this.state.payload.addressInfo.state = event.target.value;
	},

	onInputZip( event ) {
		this.state.payload.addressInfo.zipCode = event.target.value;
	},

	submitStep() {
		const jpoSiteType = this.state.payload;

		this.props.setJPOSiteType( jpoSiteType );

		SignupActions.submitSignupStep( {
			processingMessage: translate( 'Setting up your site' ),
			stepName: this.props.stepName,
			jpoSiteType
		}, [], { jpoSiteType } );

		this.props.goToNextStep();
	},

	skipStep() {
		this.props.goToNextStep();
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
					onInputBusinessName={ this.onInputBusinessName }
					onInputStreetAddress={ this.onInputStreetAddress }
					onInputCity={ this.onInputCity }
					onInputState={ this.onInputState }
					onInputZip={ this.onInputZip }
					submitStep={ this.submitStep }
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