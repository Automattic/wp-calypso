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
import { setSiteGoals } from 'state/signup/steps/site-goals/actions';
import { getSiteGoals } from 'state/signup/steps/site-goals/selectors';
import { setUserExperience } from 'state/signup/steps/user-experience/actions';
import { getUserExperience } from 'state/signup/steps/user-experience/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { getThemeForSiteGoals, getSiteTypeForSiteGoals } from 'signup/utils';
import { setSurvey } from 'state/signup/steps/survey/actions';
import { getSurveyVertical } from 'state/signup/steps/survey/selectors';
import { hints } from 'lib/signup/hint-data';
import userFactory from 'lib/user';
const user = userFactory();

//Form components
import Card from 'components/card';
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputCheckbox from 'components/forms/form-checkbox';
import SegmentedControl from 'components/segmented-control';
import ControlItem from 'components/segmented-control/item';
import Suggestions from 'components/suggestions';

class AboutStep extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			query: '',
			siteTopicValue: this.props.siteTopic,
			userExperience: this.props.userExperience,
		};
	}

	componentWillMount() {
		this.formStateController = new formState.Controller( {
			fieldNames: [ 'siteTitle', 'siteGoals', 'siteTopic' ],
			validatorFunction: noop,
			onNewState: this.setFormState,
			hideFieldErrorsOnChange: true,
			initialState: {
				siteTitle: {
					value: this.props.siteTitle,
				},
				siteGoals: {
					value: this.props.siteGoals,
				},
				siteTopic: {
					value: '',
				},
			},
		} );

		this.setFormState( this.formStateController.getInitialState() );
	}

	setFormState = state => {
		this.setState( { form: state } );
	};

	setSuggestionsRef = ref => {
		this.suggestionsRef = ref;
	};

	hideSuggestions = () => {
		this.setState( { query: '' } );
	};

	handleSuggestionChangeEvent = event => {
		this.setState( { query: event.target.value } );
		this.setState( { siteTopicValue: event.target.value } );

		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value,
		} );
	};

	handleSuggestionKeyDown = event => {
		if ( this.suggestionsRef.props.suggestions.length > 0 ) {
			const fieldName = event.target.name;
			let suggestionPosition = this.suggestionsRef.state.suggestionPosition;

			switch ( event.key ) {
				case 'ArrowRight':
					this.updateFieldFromSuggestion(
						this.getSuggestionLabel( suggestionPosition ),
						fieldName
					);

					break;
				case 'ArrowUp':
					if ( suggestionPosition === 0 ) {
						suggestionPosition = this.suggestionsRef.props.suggestions.length;
					}

					this.updateFieldFromSuggestion(
						this.getSuggestionLabel( suggestionPosition - 1 ),
						fieldName
					);

					break;
				case 'ArrowDown':
					suggestionPosition++;

					if ( suggestionPosition === this.suggestionsRef.props.suggestions.length ) {
						suggestionPosition = 0;
					}

					this.updateFieldFromSuggestion(
						this.getSuggestionLabel( suggestionPosition ),
						fieldName
					);

					break;
				case 'Tab':
					this.updateFieldFromSuggestion(
						this.getSuggestionLabel( suggestionPosition ),
						fieldName
					);

					break;
				case 'Enter':
					event.preventDefault();
					break;
			}
		}

		this.suggestionsRef.handleKeyEvent( event );
	};

	handleSuggestionMouseDown = position => {
		this.setState( { siteTopicValue: position.label } );
		this.hideSuggestions();

		this.formStateController.handleFieldChange( {
			name: 'siteTopic',
			value: position.label,
		} );
	};

	getSuggestions() {
		return hints
			.filter( hint => this.state.query && hint.match( new RegExp( this.state.query, 'i' ) ) )
			.map( hint => ( { label: hint } ) );
	}

	getSuggestionLabel( suggestionPosition ) {
		return this.suggestionsRef.props.suggestions[ suggestionPosition ].label;
	}

	updateFieldFromSuggestion( term, field ) {
		this.setState( { siteTopicValue: term } );

		this.formStateController.handleFieldChange( {
			name: field,
			value: term,
		} );
	}

	handleChangeEvent = event => {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value,
		} );
	};

	checkBoxHandleChange = event => {
		const fieldValue = formState.getFieldValue( this.state.form, 'siteGoals' );
		const valuesArray = fieldValue ? fieldValue.split( ',' ) : [];

		if ( valuesArray.indexOf( event.target.value ) === -1 ) {
			valuesArray.push( event.target.value );
		} else {
			valuesArray.splice( valuesArray.indexOf( event.target.value ), 1 );
		}

		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: valuesArray.join( ',' ),
		} );
	};

	handleCheckboxKeyDown = event => {
		if ( event.key === 'Enter' ) {
			event.preventDefault();
			event.target.checked = ! event.target.checked;
			this.checkBoxHandleChange( event );
		}
	};

	isCheckBoxChecked( goal ) {
		const initialVal = this.props.siteGoals.split( ',' );
		if ( initialVal.indexOf( goal ) !== -1 ) {
			return true;
		}

		return false;
	}

	handleSegmentClick( value ) {
		return function() {
			this.setState( {
				userExperience: value,
			} );
		}.bind( this );
	}

	handleSubmit = event => {
		event.preventDefault();
		const { goToNextStep, stepName, translate } = this.props;

		//Defaults
		let themeRepo = 'pub/radcliffe-2',
			designType = 'blog',
			siteTitleValue = 'Site Title';

		//Inputs
		const siteTitleInput = formState.getFieldValue( this.state.form, 'siteTitle' );
		const siteGoalsInput = formState.getFieldValue( this.state.form, 'siteGoals' );
		const siteGoalsArray = siteGoalsInput.split( ',' );
		const userExperienceInput = this.state.userExperience;
		const siteTopicInput = formState.getFieldValue( this.state.form, 'siteTopic' );

		//Site Title
		if ( siteTitleInput !== '' ) {
			siteTitleValue = siteTitleInput;
			this.props.setSiteTitle( siteTitleValue );
			this.props.recordTracksEvent( 'calypso_signup_actions_user_input', {
				field: 'Site title',
				value: siteTitleInput,
			} );
		}

		//Site Topic
		this.props.recordTracksEvent( 'calypso_signup_actions_user_input', {
			field: 'Site topic',
			value: siteTopicInput,
		} );

		this.props.setSurvey( {
			vertical: siteTopicInput,
			otherText: '',
			siteType: designType,
		} );

		//Site Goals
		this.props.setSiteGoals( siteGoalsInput );
		themeRepo = getThemeForSiteGoals( siteGoalsInput );
		designType = getSiteTypeForSiteGoals( siteGoalsInput );

		for ( let i = 0; i < siteGoalsArray.length; i++ ) {
			this.props.recordTracksEvent( 'calypso_signup_actions_user_input', {
				field: 'Site goals',
				value: siteGoalsArray[ i ],
			} );
		}

		//SET SITETYPE
		this.props.setDesignType( designType );

		//User Experience
		if ( ! user.get() && userExperienceInput !== '' ) {
			this.props.setUserExperience( userExperienceInput );

			this.props.recordTracksEvent( 'calypso_signup_actions_user_input', {
				field: 'User Experience',
				value: userExperienceInput,
			} );
		}

		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Collecting your information' ),
				stepName: stepName,
			},
			[],
			{
				themeSlugWithRepo: themeRepo,
				siteTitle: siteTitleValue,
				designType: designType,
				surveyQuestion: siteTopicInput,
			}
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
						onChange={ this.checkBoxHandleChange }
						defaultChecked={ this.isCheckBoxChecked( 'share' ) }
						value="share"
						className="about__checkbox"
						onKeyDown={ this.handleCheckboxKeyDown }
					/>
					<span className="about__checkbox-label">
						Share ideas, experiences, updates, reviews, stories, videos, or photos
					</span>
				</FormLabel>

				<FormLabel htmlFor="promote" className="about__checkbox-option">
					<FormInputCheckbox
						name="siteGoals"
						id="promote"
						onChange={ this.checkBoxHandleChange }
						defaultChecked={ this.isCheckBoxChecked( 'promote' ) }
						value="promote"
						className="about__checkbox"
						onKeyDown={ this.handleCheckboxKeyDown }
					/>
					<span className="about__checkbox-label">
						Promote your business, skills, organization, or events
					</span>
				</FormLabel>

				<FormLabel htmlFor="educate" className="about__checkbox-option">
					<FormInputCheckbox
						name="siteGoals"
						id="educate"
						onChange={ this.checkBoxHandleChange }
						defaultChecked={ this.isCheckBoxChecked( 'educate' ) }
						value="educate"
						className="about__checkbox"
						onKeyDown={ this.handleCheckboxKeyDown }
					/>
					<span className="about__checkbox-label">Offer education, training, or mentoring</span>
				</FormLabel>

				<FormLabel htmlFor="sell" className="about__checkbox-option">
					<FormInputCheckbox
						name="siteGoals"
						id="sell"
						onChange={ this.checkBoxHandleChange }
						defaultChecked={ this.isCheckBoxChecked( 'sell' ) }
						value="sell"
						className="about__checkbox"
						onKeyDown={ this.handleCheckboxKeyDown }
					/>
					<span className="about__checkbox-label">Sell products or collect payments</span>
				</FormLabel>

				<FormLabel htmlFor="showcase" className="about__checkbox-option">
					<FormInputCheckbox
						name="siteGoals"
						id="showcase"
						onChange={ this.checkBoxHandleChange }
						defaultChecked={ this.isCheckBoxChecked( 'showcase' ) }
						value="showcase"
						className="about__checkbox"
						onKeyDown={ this.handleCheckboxKeyDown }
					/>
					<span className="about__checkbox-label">Showcase your portfolio</span>
				</FormLabel>
			</div>
		);
	}

	renderExperienceOptions() {
		if ( user.get() ) {
			return null;
		}

		return (
			<FormFieldset className="about__last-fieldset">
				<FormLabel>How comfortable are you with creating a website?</FormLabel>
				<div className="about__segmented-control-wrapper">
					<span
						className="about__segment-label about__min-label"
						onClick={ this.handleSegmentClick( 1 ) }
					>
						Beginner
					</span>

					<SegmentedControl className="is-primary about__segmented-control">
						<ControlItem
							selected={ this.state.userExperience === 1 }
							onClick={ this.handleSegmentClick( 1 ) }
						>
							1
						</ControlItem>

						<ControlItem
							selected={ this.state.userExperience === 2 }
							onClick={ this.handleSegmentClick( 2 ) }
						>
							2
						</ControlItem>

						<ControlItem
							selected={ this.state.userExperience === 3 }
							onClick={ this.handleSegmentClick( 3 ) }
						>
							3
						</ControlItem>

						<ControlItem
							selected={ this.state.userExperience === 4 }
							onClick={ this.handleSegmentClick( 4 ) }
						>
							4
						</ControlItem>

						<ControlItem
							selected={ this.state.userExperience === 5 }
							onClick={ this.handleSegmentClick( 5 ) }
						>
							5
						</ControlItem>
					</SegmentedControl>
					<span
						className="about__segment-label about__max-label"
						onClick={ this.handleSegmentClick( 5 ) }
					>
						Expert
					</span>
				</div>
			</FormFieldset>
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
							<FormLabel>What will your site be about?</FormLabel>
							<FormTextInput
								id="siteTopic"
								name="siteTopic"
								placeholder="eg: Fashion, travel, design, plumber, electrician"
								value={ this.state.siteTopicValue }
								onChange={ this.handleSuggestionChangeEvent }
								onBlur={ this.hideSuggestions }
								onKeyDown={ this.handleSuggestionKeyDown }
								autoComplete="off"
							/>
							<Suggestions
								ref={ this.setSuggestionsRef }
								query={ this.state.query }
								suggestions={ this.getSuggestions() }
								suggest={ this.handleSuggestionMouseDown }
							/>
						</FormFieldset>

						<FormFieldset>
							<FormLabel>What’s the primary goal you have for your site?</FormLabel>
							{ this.renderGoalCheckboxes() }
						</FormFieldset>

						{ this.renderExperienceOptions() }
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
		siteGoals: getSiteGoals( state ),
		siteTopic: getSurveyVertical( state ),
		userExperience: getUserExperience( state ),
	} ),
	{ setSiteTitle, setDesignType, setSiteGoals, setSurvey, setUserExperience, recordTracksEvent }
)( localize( AboutStep ) );
