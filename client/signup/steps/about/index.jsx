/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import formState from 'lib/form-state';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';
import { setDesignType } from 'state/signup/steps/design-type/actions';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

//Form components
import Card from 'components/card';
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputCheckbox from 'components/forms/form-checkbox';

class AboutStep extends Component {
	componentWillMount() {
		this.formStateController = new formState.Controller( {
			fieldNames: [ 'siteTitle', 'siteGoals' ],
			validatorFunction: noop,
			onNewState: this.setFormState,
			hideFieldErrorsOnChange: true,
			initialState: {
				siteTitle: {
					value: '',
				},
				siteGoals: {
					value: '',
				},
			},
		} );

		this.setFormState( this.formStateController.getInitialState() );
	}

	setFormState = state => {
		this.setState( { form: state } );
	};

	handleChangeEvent = event => {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value,
		} );
	};

	handleSubmit = event => {
		event.preventDefault();
		const { goToNextStep, stepName, translate } = this.props;

		//Defaults
		const themeRepo = 'pub/radcliffe-2',
			designType = 'blog';
		let siteTitleValue = 'Site Title';

		//Inputs
		const siteTitleInput = formState.getFieldValue( this.state.form, 'siteTitle' );

		if ( siteTitleInput !== '' ) {
			siteTitleValue = siteTitleInput;

			this.props.setSiteTitle( siteTitleValue );
			this.props.recordTracksEvent( 'calypso_signup_actions_user_input', {
				field: 'Site title',
				value: siteTitleInput,
			} );
		}

		this.props.setDesignType( designType );

		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Collecting your information' ),
				stepName: stepName,
				themeRepo,
				siteTitleValue,
			},
			[],
			{ themeSlugWithRepo: themeRepo, siteTitle: siteTitleValue }
		);

		goToNextStep();
	};

	renderGoalCheckboxes() {
		return (
			<div className="about__checkboxes">
				<FormLabel htmlFor="share" className="about__checkbox-option">
					<FormInputCheckbox
						name="siteGoals"
						id="share"
						onChange={ this.handleChangeEvent }
						value="Share ideas, experiences, updates, reviews, stories, videos, or photos"
						className="about__checkbox"
					/>
					<span className="about__checkbox-label">
						Share ideas, experiences, updates, reviews, stories, videos, or photos
					</span>
				</FormLabel>

				<FormLabel htmlFor="promote" className="about__checkbox-option">
					<FormInputCheckbox
						name="siteGoals"
						id="promote"
						onChange={ this.handleChangeEvent }
						value="Promote your business, skills, organization, or events"
						className="about__checkbox"
					/>
					<span className="about__checkbox-label">
						Promote your business, skills, organization, or events
					</span>
				</FormLabel>

				<FormLabel htmlFor="educate" className="about__checkbox-option">
					<FormInputCheckbox
						name="siteGoals"
						id="educate"
						onChange={ this.handleChangeEvent }
						value="Offer education, training, or mentoring"
						className="about__checkbox"
					/>
					<span className="about__checkbox-label">Offer education, training, or mentoring</span>
				</FormLabel>

				<FormLabel htmlFor="sell" className="about__checkbox-option">
					<FormInputCheckbox
						name="siteGoals"
						id="sell"
						onChange={ this.handleChangeEvent }
						value="Sell products or collect payments"
						className="about__checkbox"
					/>
					<span className="about__checkbox-label">Sell products or collect payments</span>
				</FormLabel>

				<FormLabel htmlFor="showcase" className="about__checkbox-option">
					<FormInputCheckbox
						name="siteGoals"
						id="showcase"
						onChange={ this.handleChangeEvent }
						value="Showcase your portfolio"
						className="about__checkbox"
					/>
					<span className="about__checkbox-label">Showcase your portfolio</span>
				</FormLabel>
			</div>
		);
	}

	renderContent() {
		const { translate, siteTitle } = this.props;

		return (
			<div className="about__wrapper">
				<form onSubmit={ this.handleSubmit }>
					<Card>
						<FormFieldset>
							<FormLabel htmlFor="siteTitle">What would you like to name your site?</FormLabel>
							<FormTextInput
								id="siteTitle"
								name="siteTitle"
								placeholder="eg: Mel's Diner, Stevie’s Blog, Vail Renovations"
								defaultValue={ siteTitle }
								onChange={ this.handleChangeEvent }
							/>
						</FormFieldset>

						<FormFieldset>
							<FormLabel>What’s the primary goal you have for your site?</FormLabel>
							{ this.renderGoalCheckboxes() }
						</FormFieldset>
					</Card>
					<div className="about__submit-wrapper">
						<Button primary={ true } type="submit">
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</form>
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
				headerText={ translate( 'Let’s create a site' ) }
				subHeaderText={ translate(
					'Please answer these questions so we can help you make the site you need.'
				) }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

export default connect(
	state => ( {
		siteTitle: getSiteTitle( state ),
	} ),
	{ setSiteTitle, setDesignType, recordTracksEvent }
)( localize( AboutStep ) );
