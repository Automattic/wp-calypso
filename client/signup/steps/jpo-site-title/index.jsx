/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */ 
import analytics from 'lib/analytics';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Card from 'components/card';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import JPOTextarea from './jpo-textarea';
import FormFieldset from 'components/forms/form-fieldset';
import formState from 'lib/form-state';
import Button from 'components/button';
import { translate } from 'i18n-calypso';

import { setJPOSiteTitle } from 'state/signup/steps/jpo-site-title/actions';
import { getJPOSiteTitle } from 'state/signup/steps/jpo-site-title/selectors';

const JPOSiteTitleStep = React.createClass( {
	errorMessage: '',

	propTypes: {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOSiteTitle: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string
	},

	componentWillMount() {
		this.formStateController = new formState.Controller( {
			fieldNames: [ 'siteTitle', 'siteDescription' ],
			validatorFunction: noop,
			onNewState: this.setFormState,
			hideFieldErrorsOnChange: true,
			initialState: {
				siteTitle: {
					value: ''
				},
				siteDescription: {
					value: ''
				}
			}
		} );

		this.setFormState( this.formStateController.getInitialState() );
	},

	setFormState( state ) {
		this.setState( { form: state } );
	},

	handleChangeEvent( event ) {
		if ( 'siteTitle' === event.target.name ) {
			this.setState( { siteTitleInvalid: false } );
		}

		if ( 'siteDescription' === event.target.name ) {
			this.setState( { siteDescriptionInvalid: false } );
		}

		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	},

	getPayload() {
		return {
			siteTitle: formState.getFieldValue( this.state.form, 'siteTitle' ),
			siteDescription: formState.getFieldValue( this.state.form, 'siteDescription' )
		};
	},

	submitStep() {
		const jpoSiteTitle = this.getPayload();

		if ( ! jpoSiteTitle.siteTitle ) {
			this.errorMessage = 'Please enter a valid site name and description.';
			this.setState( { siteTitleInvalid: true } );
		}

		if ( ! jpoSiteTitle.siteDescription ) {
			this.errorMessage = 'Please enter a valid site name and description.';
			this.setState( { siteDescriptionInvalid: true } );
		}

		console.log( jpoSiteTitle.siteTitle, jpoSiteTitle.siteDescription );

		if ( ! ( jpoSiteTitle.siteTitle && jpoSiteTitle.siteDescription ) ) {
			return false;
		}

		this.props.setJPOSiteTitle( jpoSiteTitle );

		SignupActions.submitSignupStep( {
			processingMessage: translate( 'Setting up your site' ),
			stepName: this.props.stepName,
			jpoSiteTitle
		}, [], { jpoSiteTitle } );

		this.props.goToNextStep();
	},

	skipStep() {
		this.props.goToNextStep();
	},

	renderStepContent() {
		return (
			<Card className="jpo__site-title-card">
				<FormFieldset>
					<FormLabel>{ translate( 'Site Title' ) }</FormLabel>
					<FormTextInput 
						isError={ this.state.siteTitleInvalid }
						className="jpo__site-title-input"
						name="siteTitle"
						onChange={ this.handleChangeEvent }
					/>
					<FormLabel>{ translate( 'Site Description' ) }</FormLabel>
					<JPOTextarea
						isError={ this.state.siteDescriptionInvalid } 
						className="jpo__site-description-input" 
						name="siteDescription"
						onChange={ this.handleChangeEvent }
					/>
					<FormLabel className="jpo__validation-error">{ this.errorMessage }</FormLabel>
					<Button primary onClick={ this.submitStep } className="jpo__site-title-submit">{ translate( 'Next Step' ) }</Button>
				</FormFieldset>
			</Card>
		);
	},

	render() {
		const headerText = translate( 'Let\'s get started.' );
		const subHeaderText = translate( 'First up, what would you like to name your site and have as its public description?' );

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
	{ setJPOSiteTitle }
)( JPOSiteTitleStep );
