/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import i18n, { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

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
import InfoPopover from 'components/info-popover';

class SiteInformation extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			name: props.siteTitle,
			address: props.siteInformation.address,
			phone: props.siteInformation.phone,
		};
	}

	handleInputChange = ( { target: { name, value } } ) => this.setState( { [ name ]: [ value ] } );

	handleSubmit = event => {
		event.preventDefault();
		this.props.submitStep( ...this.state );
	};

	renderContent() {
		const { translate, isBusinessSiteSelected, siteNameLabelText } = this.props;

		return (
			<div className="site-information__wrapper">
				<div className="site-information__form-wrapper ">
					<form onSubmit={ this.handleSubmit }>
						<Card>
							<h3>{ translate( 'Enter your basic information' ) }</h3>

							<FormFieldset>
								<FormLabel htmlFor="name">
									{ siteNameLabelText }
									<InfoPopover className="site-information__info-popover" position="top">
										{ translate( 'This will be used for the title of your site.' ) }
									</InfoPopover>
								</FormLabel>
								<FormTextInput
									id="name"
									name="name"
									placeholder={ translate( 'eg. Google, Automattic, AirBnb' ) }
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
											placeholder={ 'eg. 21 Main street\nOttawa  ON\nK1V 2K5' }
											onChange={ this.handleInputChange }
											value={ this.state.address }
										/>
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
											placeholder={ translate( 'eg. (613) 425-0183' ) }
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

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ translate( 'Almost done, just a few more things.' ) }
				subHeaderText={ translate( "We'll add this information to your new website." ) }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() }
				backUrl={ '/start/main-onboarding/business-needs' }
			/>
		);
	}
}

/**
 * Returns translated text for the name field depending on the site type
 *
 * @param   {String} siteType E.g,'business', 'blog'
 * @returns {String|Object} TranslatableString
 */
function getSiteNameLabelText( siteType ) {
	switch ( siteType ) {
		case 'business':
			return i18n.translate( 'Business name' );
		case 'blog':
			return i18n.translate( 'Blog name' );
	}
	return i18n.translate( 'Site name' );
}

export default connect(
	state => {
		const siteType = getSiteType( state );
		return {
			isLoggedIn: isUserLoggedIn( state ),
			siteInformation: getSiteInformation( state ),
			siteTitle: getSiteTitle( state ),
			isBusinessSiteSelected: 'business' === siteType,
			siteNameLabelText: getSiteNameLabelText( siteType ),
		};
	},
	( dispatch, ownProps ) => ( {
		submitStep: ( { name, address, phone } ) => {
			dispatch( setSiteTitle( name ) );
			dispatch( setSiteInformation( { address, phone } ) );
			// Create site
			SignupActions.submitSignupStep(
				{
					processingMessage: i18n.translate( 'Collecting your information' ),
					stepName: ownProps.stepName,
				},
				[],
				{
					address,
					phone,
				}
			);
			ownProps.goToNextStep( ownProps.flowName );
		},
	} )
)( localize( SiteInformation ) );
