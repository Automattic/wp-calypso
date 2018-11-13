/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import EmailValidator from 'email-validator';
import { connect } from 'react-redux';
import i18n, { localize } from 'i18n-calypso';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { isUserLoggedIn } from 'state/current-user/selectors';
import { getSiteInformation } from 'state/signup/steps/site-information/selectors';
import { setSiteInformation } from 'state/signup/steps/site-information/actions';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';
import Card from 'components/card';
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import InfoPopover from 'components/info-popover';
import { dasherize } from 'lib/signup/site-type';

class SiteInformation extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			name: props.siteTitle,
			address: props.siteInformation.address,
			email: props.siteInformation.email,
			showEmailError: props.siteInformation.email,
			isEmailValid: true,
			phone: props.siteInformation.phone,
		};
	}

	handleInputChange = ( { target: { name, value } } ) => {
		if ( 'email' === name ) {
			const isEmailValid = ! trim( value ) || EmailValidator.validate( trim( value ) );
			return this.setState( {
				[ name ]: value,
				isEmailValid,
				showEmailError: false,
			} );
		}
		this.setState( { [ name ]: value } );
	};

	handleSubmit = event => {
		event.preventDefault();
		if ( ! this.state.isEmailValid ) {
			return this.setState( {
				showEmailError: true,
			} );
		}
		this.props.submitStep( this.state );
	};

	renderContent() {
		const { translate, isBusinessSiteSelected, siteNameText } = this.props;

		return (
			<div className="site-information__wrapper">
				<div className="site-information__form-wrapper ">
					<form onSubmit={ this.handleSubmit }>
						<Card>
							<FormFieldset>
								<FormLabel htmlFor="name">
									{ siteNameText.label }
									<InfoPopover className="site-information__info-popover" position="top">
										{ translate( 'This will be used for the title of your site.' ) }
									</InfoPopover>
								</FormLabel>
								<FormTextInput
									id="name"
									name="name"
									placeholder={ siteNameText.placeholder }
									onChange={ this.handleInputChange }
									value={ this.state.name }
								/>
							</FormFieldset>

							{ isBusinessSiteSelected && (
								<Fragment>
									<FormFieldset>
										<FormLabel htmlFor="address">
											{ translate( 'Address' ) }
											<InfoPopover className="site-information__info-popover" position="top">
												{ translate( 'Where can people find your business?' ) }
											</InfoPopover>
										</FormLabel>
										<FormTextarea
											id="address"
											name="address"
											placeholder={ 'E.g. 21 Main street\nOttawa  ON\nK1V 2K5' }
											onChange={ this.handleInputChange }
											value={ this.state.address }
										/>
									</FormFieldset>
									<FormFieldset>
										<FormLabel htmlFor="email">
											{ translate( 'Contact Email' ) }
											<InfoPopover className="site-information__info-popover" position="top">
												{ translate( 'Does your business have an email address?' ) }
											</InfoPopover>
										</FormLabel>
										<FormTextInput
											id="email"
											name="email"
											isError={ ! this.state.isEmailValid }
											placeholder={ 'E.g. email@domain.com' }
											onChange={ this.handleInputChange }
											value={ this.state.email }
										/>
										{ this.state.shouldShowEmailError && (
											<FormInputValidation
												isError={ this.state.shouldShowEmailError }
												text={ translate( 'Please provide a valid email address.' ) }
											/>
										) }
									</FormFieldset>
									<FormFieldset>
										<FormLabel htmlFor="phone">
											{ translate( 'Phone number' ) }
											<InfoPopover className="site-information__info-popover" position="top">
												{ translate( 'How can people contact you?' ) }
											</InfoPopover>
										</FormLabel>
										<FormTextInput
											id="phone"
											name="phone"
											placeholder={ translate( 'E.g. (555) 555-5555' ) }
											onChange={ this.handleInputChange }
											value={ this.state.phone }
										/>
									</FormFieldset>
								</Fragment>
							) }
							<div className="site-information__submit-wrapper">
								<Button primary={ true } type="submit">
									{ translate( 'Continue' ) }
								</Button>
							</div>
						</Card>
					</form>
				</div>
			</div>
		);
	}

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

		const headerText = translate( 'Almost done, just a few more things.' );
		const subHeaderText = translate( "We'll add this information to your new website." );

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

/**
 * Returns translated label and placeholder for the name field depending on the site type
 *
 * @param   {String} siteType E.g,'business', 'blog'
 * @returns {Object} label and placeholder object
 */
function getSiteNameText( siteType ) {
	//TODO: After site-type component is merged, fetch segment names from lib/site-type.js
	switch ( dasherize( siteType ) ) {
		case 'business':
			return {
				label: i18n.translate( 'Business name' ),
				placeholder: i18n.translate( "eg. Juliana's Pizza" ),
			};
		case 'blog':
			return {
				label: i18n.translate( 'Blog name' ),
				placeholder: i18n.translate( 'eg. My travel blog ' ),
			};
	}
	return {
		label: i18n.translate( 'Site name' ),
		placeholder: i18n.translate( 'eg. My portfolio' ),
	};
}

export default connect(
	state => {
		const siteType = getSiteType( state );
		return {
			isLoggedIn: isUserLoggedIn( state ),
			siteInformation: getSiteInformation( state ),
			siteTitle: getSiteTitle( state ),
			isBusinessSiteSelected: dasherize( 'business' ) === dasherize( siteType ),
			siteNameText: getSiteNameText( siteType ),
		};
	},
	( dispatch, ownProps ) => ( {
		submitStep: ( { name, address, email, phone } ) => {
			address = trim( address );
			email = trim( email );
			phone = trim( phone );
			dispatch( setSiteTitle( trim( name ) ) );
			dispatch( setSiteInformation( { address, email, phone } ) );
			// Create site
			SignupActions.submitSignupStep(
				{
					processingMessage: i18n.translate( 'Collecting your information' ),
					stepName: ownProps.stepName,
				},
				[],
				{
					address,
					email,
					phone,
				}
			);
			ownProps.goToNextStep( ownProps.flowName );
		},
	} )
)( localize( SiteInformation ) );
