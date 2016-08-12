/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import LoggedOutForm from 'components/logged-out-form';

import formState from 'lib/form-state';
import ValidationFieldset from 'signup/validation-fieldset';
import FormLabel from 'components/forms/form-label';
import FormButton from 'components/forms/form-button';
import FormTextInput from 'components/forms/form-text-input';

import ExampleSiteTitle from './example-site-title';

const SiteTitle = React.createClass( {
	displayName: 'Site Title',

	contextTypes: {
		store: React.PropTypes.object,
	},

	propTypes: {
		goToNextStep: React.PropTypes.func.isRequired,
	},

	getInitialState() {
		return {
			form: {
				siteTitle: {
					value: this.props.siteTitle
				}
			}
		};
	},
	componentWillMount() {
		let initialState = this.state.form;

		if ( this.props.step && this.props.step.form ) {
			initialState = Object.assign( {}, initialState, this.props.step.form );

			if ( ! isEmpty( this.props.step.errors ) ) {
				initialState = formState.setFieldErrors( formState.setFieldsValidating( initialState ), {
					siteTitle: this.props.step.errors[ 0 ].message
				}, true );
			}
		}

		this.formStateController = new formState.Controller( {
			fieldNames: [ 'siteTitle' ],
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError,
			hideFieldErrorsOnChange: true,
			initialState: initialState
		} );

		this.setState( { form: this.formStateController.getInitialState() } );
	},

	validate( fields, onComplete ) {
		// TODO implement validation of the site title step
		onComplete( null, {} );
	},

	setFormState( state ) {
		this.setState( { form: state } );
	},
	handleBlur() {
		this.formStateController.sanitize();
		this.formStateController.validate();
		this.save();
	},

	save() {
		this.props.setSiteTitle( this.state.form.siteTitle.value );

		SignupActions.saveSignupStep( {
			stepName: 'site-title',
			form: this.state.form,
			siteTitle: this.state.form.siteTitle.value
		} );
	},
	handleChangeEvent( event ) {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	},

	handleFormControllerError( error ) {
		if ( error ) {
			throw error;
		}
	},

	skipStep() {
		this.props.setSiteTitle( '' );
		this.state.form.siteTitle.value = '';

		SignupActions.saveSignupStep( {
			stepName: 'site-title',
			form: this.state.form,
			siteTitle: ''
		} );

		if ( 'function' === typeof this.props.goToNextStep ) {
			this.props.goToNextStep();
		}
	},
	formFields() {
		return (
			<ValidationFieldset>
				<FormLabel className="signup-site-title__label" htmlFor="siteTitle">
					{ this.translate( 'Choose a site title' ) }
				</FormLabel>
				<FormTextInput
					autoFocus={ true }
					autoCapitalize={ 'off' }
					className="signup-site-title__input"
					type="text"
					name="siteTitle"
					placeholder="Give your site a title"
					value={ this.state.form.siteTitle.value }
					onBlur={ this.handleBlur }
					onChange={ this.handleChangeEvent }
				/>
				<FormButton className="signup-site-title__button">Continue</FormButton>
			</ValidationFieldset>
		);
	},

	handleSubmit( event ) {
		event.preventDefault();

		this.formStateController.handleSubmit( ( hasErrors ) => {
			const siteTitle = formState.getFieldValue( this.state.form, 'siteTitle' );

			if ( hasErrors ) {
				return;
			}

			SignupActions.submitSignupStep( {
				processingMessage: this.translate( 'Setting up your site' ),
				stepName: this.props.stepName,
				form: this.state.form,
				siteTitle
			}, [], { siteTitle } );

			this.props.goToNextStep();
		} );
	},

	renderSiteTitleStep() {
		return (
			<div className="signup-site-title__section-wrapper">
				<LoggedOutForm className="signup-site-title" onSubmit={ this.handleSubmit } noValidate>
					{ this.formFields() }
				</LoggedOutForm>
				<ExampleSiteTitle/>
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
					headerText={ this.translate( 'What is your site title?' ) }
					subHeaderText={ this.translate( 'WordPress.com is the best place for your WordPress blog or website.' ) }
					signupProgressStore={ this.props.signupProgressStore }
					stepContent={ this.renderSiteTitleStep() }
					goToNextStep={ this.skipStep }
				/>
			</div>
		);
	}
} );

export default connect(
	state => ( {
		siteTitle: getSiteTitle( state ),
	} ),
	{ setSiteTitle: setSiteTitle }
)( SiteTitle );
