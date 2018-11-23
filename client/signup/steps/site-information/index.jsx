/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
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
										{ translate( 'This will be used as the title of your site.' ) }
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
										/>
									</FormFieldset>
								</Fragment>
							) }

							<div className="site-information__submit-wrapper">
								<Button primary={ true } type="submit" onClick={ this.handleSubmit }>
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
	( dispatch, ownProps ) => ( {
		submitStep: ( { name, address, email, phone } ) => {
			const siteTitle = trim( name );
			address = trim( address );
			email = trim( email );
			phone = trim( phone );
			dispatch( setSiteTitle( siteTitle ) );
			dispatch( setSiteInformation( { address, email, phone } ) );
			
			// Submit step
			SignupActions.submitSignupStep(
				{
					processingMessage: i18n.translate( 'Collecting your information' ),
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
	} )
)( localize( SiteInformation ) );
