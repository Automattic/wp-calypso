/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
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
import FormTelInput from 'components/forms/form-tel-input';
import FormTextarea from 'components/forms/form-textarea';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import InfoPopover from 'components/info-popover';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class SiteInformation extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			name: props.siteTitle,
			address: props.siteInformation.address || '',
			email: props.siteInformation.email || '',
			phone: props.siteInformation.phone || '',
		};
	}

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	handleInputChange = ( { target: { name, value } } ) => {
		this.setState( { [ name ]: value } );
		if ( this.props.flowName === 'onboarding-dev' ) {
			setTimeout( () => {
				this.props.updateStep( this.state );
			}, 50 );
		}
	};

	handleSubmit = event => {
		event.preventDefault();

		this.props.submitStep( this.state );
	};

	renderContent() {
		const { translate, siteType } = this.props;
		const siteTitleLabel = getSiteTypePropertyValue( 'slug', siteType, 'siteTitleLabel' ) || '';
		const siteTitlePlaceholder =
			getSiteTypePropertyValue( 'slug', siteType, 'siteTitlePlaceholder' ) || '';
		const isBusinessSiteSelected =
			siteType === getSiteTypePropertyValue( 'slug', 'business', 'slug' );

		return (
			<div className="site-information__wrapper">
				<div className="site-information__form-wrapper ">
					<form>
						<Card>
							<FormFieldset>
								<FormLabel htmlFor="name">
									{ siteTitleLabel }
									<InfoPopover className="site-information__info-popover" position="top">
										{ translate(
											"We'll use this as your site title. Don't worry, you can change this later."
										) }
									</InfoPopover>
								</FormLabel>
								<FormTextInput
									id="name"
									name="name"
									placeholder={ siteTitlePlaceholder }
									onChange={ this.handleInputChange }
									value={ this.state.name }
								/>
							</FormFieldset>

							{ isBusinessSiteSelected && (
								<>
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
											placeholder={ 'E.g. 60 29th Street #343\nSan Francisco, CA\n94110' }
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
											type="email"
											placeholder={ 'E.g. email@domain.com' }
											onChange={ this.handleInputChange }
											value={ this.state.email }
										/>
									</FormFieldset>
									<FormFieldset>
										<FormLabel htmlFor="phone">
											{ translate( 'Phone number' ) }
											<InfoPopover className="site-information__info-popover" position="top">
												{ translate( 'How can people contact you?' ) }
											</InfoPopover>
										</FormLabel>
										<FormTelInput
											id="phone"
											name="phone"
											placeholder={ translate( 'E.g. (555) 555-5555' ) }
											onChange={ this.handleInputChange }
											value={ this.state.phone }
											pattern="*"
										/>
									</FormFieldset>
								</>
							) }

							<div className="site-information__submit-wrapper">
								<Button primary type="submit" onClick={ this.handleSubmit }>
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

		const headerText = translate( 'Help customers find you' );
		const subHeaderText = '';

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

export default connect(
	state => {
		const siteType = getSiteType( state );
		return {
			isLoggedIn: isUserLoggedIn( state ),
			siteInformation: getSiteInformation( state ),
			siteTitle: getSiteTitle( state ),
			siteType,
		};
	},
	( dispatch, ownProps ) => {
		function updateStep( { name, address, email, phone } ) {
			dispatch( setSiteTitle( name ) );
			dispatch( setSiteInformation( { address, email, phone } ) );
		}

		return {
			submitStep: ( { name, address, email, phone } ) => {
				const siteTitle = trim( name );
				const siteTitleTracksAttribute = siteTitle || 'N/A';
				address = trim( address );
				email = trim( email );
				phone = trim( phone );

				updateStep( { name: siteTitle, address, email, phone } );

				dispatch(
					recordTracksEvent( 'calypso_signup_actions_submit_site_information', {
						site_title: siteTitleTracksAttribute,
						address,
						email,
						phone,
					} )
				);

				// Create site
				SignupActions.submitSignupStep(
					{
						processingMessage: i18n.translate( 'Populating your contact information.' ),
						stepName: ownProps.stepName,
					},
					[],
					{
						siteTitle,
						address,
						email,
						phone,
					}
				);
				ownProps.goToNextStep( ownProps.flowName );
			},
			updateStep,
		};
	}
)( localize( SiteInformation ) );
