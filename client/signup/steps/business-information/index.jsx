/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { isUserLoggedIn } from 'state/current-user/selectors';

//Form components
import Card from 'components/card';
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import InfoPopover from 'components/info-popover';

class BusinessInformation extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			businessInformation: get(
				this.props,
				'signupProgress[3].providedDependencies.businessInformation',
				{}
			),
		};
	}

	handleSubmit = event => {
		event.preventDefault();
		const { goToNextStep, stepName, flowName, translate } = this.props;

		//Create site
		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Collecting your information' ),
				stepName: stepName,
			},
			[],
			{
				businessInformation: this.state.businessInformation,
			}
		);

		goToNextStep( flowName );
	};

	renderContent() {
		const { translate } = this.props;

		return (
			<div className="business-information__wrapper">
				<div className="business-information__form-wrapper ">
					<form onSubmit={ this.handleSubmit }>
						<Card>
							<h3>{ translate( 'Enter your basic information' ) }</h3>

							<FormFieldset>
								<FormLabel htmlFor="name">
									{ translate( 'Business Name' ) }

									<InfoPopover className="business-information__info-popover" position="top">
										{ translate( 'This will be used for the title of your site.' ) }
									</InfoPopover>
								</FormLabel>
								<FormTextInput
									id="name"
									name="name"
									placeholder={ translate( 'eg. Google, Automattic, AirBnb' ) }
									onChange={ this.handleChangeEvent }
								/>
							</FormFieldset>

							<FormFieldset>
								<FormLabel htmlFor="address">
									{ translate( 'Address' ) }
									<InfoPopover className="business-information__info-popover" position="top">
										{ translate( 'Where can people find your business?' ) }
									</InfoPopover>
								</FormLabel>
								<FormTextarea
									id="address"
									name="address"
									placeholder={ 'eg. 21 Main street\nOttawa  ON\nK1V 2K5' }
									onChange={ this.handleChangeEvent }
								/>
							</FormFieldset>

							<FormFieldset>
								<FormLabel htmlFor="phone">
									{ translate( 'Phone number' ) }
									<InfoPopover className="business-information__info-popover" position="top">
										{ translate( 'How can people contact you?' ) }
									</InfoPopover>
								</FormLabel>
								<FormTextInput
									id="phone"
									name="phone"
									placeholder={ translate( 'eg. (613) 425-0183' ) }
									onChange={ this.handleChangeEvent }
								/>
							</FormFieldset>

							<div className="business-information__submit-wrapper">
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

export default connect(
	state => ( {
		isLoggedIn: isUserLoggedIn( state ),
	} ),
	{}
)( localize( BusinessInformation ) );
