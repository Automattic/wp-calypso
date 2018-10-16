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
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';

class BusinessNeeds extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			businessNeeds: get( this.props, 'signupProgress[2].providedDependencies.businessNeeds', '' ),
		};
	}

	checkBoxHandleChange = event => {
		const fieldValue = this.state.businessNeeds;
		const valuesArray = fieldValue ? fieldValue.split( ',' ) : [];

		if ( valuesArray.indexOf( event.target.value ) === -1 ) {
			valuesArray.push( event.target.value );
		} else {
			valuesArray.splice( valuesArray.indexOf( event.target.value ), 1 );
		}

		this.setState( { businessNeeds: valuesArray.join( ',' ) } );
	};

	isCheckBoxChecked( goal ) {
		//const fieldValue = this.state.businessNeeds;
		const initialVal = this.state.businessNeeds.split( ',' );
		if ( initialVal.indexOf( goal ) !== -1 ) {
			return true;
		}

		return false;
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
				businessNeeds: this.state.businessNeeds,
			}
		);

		goToNextStep( flowName );
	};

	renderNeedsCheckboxes() {
		const { translate } = this.props;
		// Note that the key attributes will be used in the name of a tracks event attribute so can not
		// contain whitespace.
		const options = {
			contact: {
				key: 'contact',
				formLabel: translate( 'Allow people to get in touch with you' ),
			},
			payments: {
				key: 'payments',
				formLabel: translate( 'Collect payments for your services' ),
			},
			appointments: {
				key: 'appointments',
				formLabel: translate( 'Book appointments into your calendar' ),
			},
			showcase: {
				key: 'showcase',
				formLabel: translate( 'Showcase your products or work' ),
			},
			sell: {
				key: 'sell',
				formLabel: translate( 'Sell your products online' ),
			},
			share: {
				key: 'share',
				formLabel: translate( 'Share your news, updates, or blog posts' ),
			},
			capture: {
				key: 'capture',
				formLabel: translate( 'Capture email addresses' ),
			},
		};

		const businessNeedsArray = [
			'contact',
			'payments',
			'appointments',
			'showcase',
			'sell',
			'share',
			'capture',
		];

		return (
			<div className="business-needs__checkboxes">
				{ businessNeedsArray.map( item => {
					return (
						<FormLabel
							htmlFor={ options[ item ].key }
							className="business-needs__checkbox-option"
							key={ options[ item ].key }
						>
							<FormInputCheckbox
								name="businessNeeds"
								id={ options[ item ].key }
								onChange={ this.checkBoxHandleChange }
								defaultChecked={ this.isCheckBoxChecked( options[ item ].key ) }
								value={ options[ item ].key }
								className="business-needs__checkbox"
							/>
							<span className="business-needs__checkbox-label">{ options[ item ].formLabel }</span>
						</FormLabel>
					);
				} ) }
			</div>
		);
	}

	renderContent() {
		const { translate } = this.props;

		return (
			<div className="business-needs__wrapper">
				<div className="business-needs__form-wrapper ">
					<form onSubmit={ this.handleSubmit }>
						<Card>
							<h3>{ translate( 'Choose what you need' ) }</h3>
							{ translate( "Don't stress, you can change this later." ) }

							<FormFieldset>{ this.renderNeedsCheckboxes() }</FormFieldset>

							<div className="business-needs__submit-wrapper">
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
				headerText={ translate( 'What does your site need to do?' ) }
				subHeaderText={ translate( "We'll use your answer add sections to your website." ) }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

export default connect(
	state => ( {
		isLoggedIn: isUserLoggedIn( state ),
	} ),
	{}
)( localize( BusinessNeeds ) );
