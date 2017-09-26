/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import get from 'lodash/get';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { setJPOSiteType } from 'state/signup/steps/jpo-site-type/actions';
import formState from 'lib/form-state';
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
			genre: '',
			businessPersonal: ''
		};
	},

	getPayload() {
		return {
			genre: this.state.genre,
			businessPersonal: this.state.businessPersonal,
			...this.getBusinessInfo()
		};
	},

	componentWillMount() {
		this.formStateController = new formState.Controller( {
			fieldNames: [ 'businessName', 'streetAddress', 'city', 'state', 'zipCode' ],
			validatorFunction: noop,
			onNewState: this.setFormState,
			hideFieldErrorsOnChange: true,
			initialState: {
				businessName: {
					value: get( this.props.signupDependencies, [ 'jpoSiteType', 'businessName' ], '' )
				},
				streetAddress: {
					value: get( this.props.signupDependencies, [ 'jpoSiteType', 'streetAddress' ], '' )
				},
				city: {
					value: get( this.props.signupDependencies, [ 'jpoSiteType', 'city' ], '' )
				},
				state: {
					value: get( this.props.signupDependencies, [ 'jpoSiteType', 'state' ], '' )
				},
				zipCode: {
					value: get( this.props.signupDependencies, [ 'jpoSiteType', 'zipCode' ], '' )
				}
			}
		} );

		this.setFormState( this.formStateController.getInitialState() );
	},

	setFormState( state ) {
		this.setState( { form: state } );
	},

	handleBusinessInfo( event ) {
		const { name, value } = event.target;

		this.formStateController.handleFieldChange( {
			name: name,
			value: value
		} );
	},

	getBusinessInfo() {
		return {
			businessName: formState.getFieldValue( this.state.form, 'businessName' ),
			streetAddress: formState.getFieldValue( this.state.form, 'streetAddress' ),
			city: formState.getFieldValue( this.state.form, 'city' ),
			state: formState.getFieldValue( this.state.form, 'state' ),
			zipCode: formState.getFieldValue( this.state.form, 'zipCode' )
		};
	},

	onSelectBlog() {
		this.handleSiteKind( 'blog' );
	},

	onSelectWebsite() {
		this.handleSiteKind( 'website' );
	},

	onSelectPortfolio() {
		this.handleSiteKind( 'portfolio' );
	},

	onSelectStore() {
		this.handleSiteKind( 'store' );
	},

	handleSiteKind( kind ) {
		this.setState( {
			genre: kind,
			currentScreen: 'businesspersonal'
		} );
	},

	onSelectPersonal() {
		this.setState( {
			businessPersonal: 'personal',
		} );
		this.submitStep();
	},

	onSelectBusiness() {
		this.setState( {
			businessPersonal: 'business',
			headerText: translate( 'Add a business address.' ),
			subHeaderText: translate( 'Enter your business address to have a map added to your website.' ),
			currentScreen: 'businessaddress'
		} );
	},

	submitStep() {
		const jpoSiteType = this.getPayload();

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
			<div className="jpo-site-type">
				<SelectGenre
					current={ this.state.currentScreen === 'genre' }
					onSelectBlog={ this.onSelectBlog }
					onSelectWebsite={ this.onSelectWebsite }
					onSelectPortfolio={ this.onSelectPortfolio }
					onSelectStore={ this.onSelectStore }
					signupDependencies={ this.props.signupDependencies }
				/>
				<SelectBusinessPersonal
					current={ this.state.currentScreen === 'businesspersonal' }
					onSelectPersonal={ this.onSelectPersonal }
					onSelectBusiness={ this.onSelectBusiness }
					signupDependencies={ this.props.signupDependencies }
				/>
				<SelectBusinessAddress
					current={ this.state.currentScreen === 'businessaddress' }
					submitStep={ this.submitStep }
					signupDependencies={ this.props.signupDependencies }
					handleBusinessInfo={ this.handleBusinessInfo }
					businessInfo={ this.getBusinessInfo() }
				/>
			</div>
		);
	},

	render() {
		return (
			<div className="jpo-site-type">
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
