/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { invoke, noop, findKey } from 'lodash';
import classNames from 'classnames';

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
import { DESIGN_TYPE_STORE } from 'signup/constants';
import PressableStoreStep from '../design-type-with-store/pressable-store';
import { abtest } from 'lib/abtest';
import { isUserLoggedIn } from 'state/current-user/selectors';

//Form components
import Card from 'components/card';
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
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
			showStore: false,
			pendingStoreClick: false,
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

	setPressableStore = ref => {
		this.pressableStore = ref;
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
		return Object.values( hints )
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

	handleStoreBackClick = () => {
		this.setState( { showStore: false }, this.scrollUp );
		return;
	};

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
		const siteGoalsGroup = siteGoalsArray.sort().join();
		const userExperienceInput = this.state.userExperience;
		const siteTopicInput = formState.getFieldValue( this.state.form, 'siteTopic' );

		const eventAttributes = {};

		//Site Title
		if ( siteTitleInput !== '' ) {
			siteTitleValue = siteTitleInput;
			this.props.setSiteTitle( siteTitleValue );
		}

		eventAttributes.site_title = siteTitleInput || 'N/A';

		//Site Topic
		const englishSiteTopicInput =
			findKey( hints, siteTopic => siteTopic === siteTopicInput ) || siteTopicInput;

		eventAttributes.site_topic = englishSiteTopicInput || 'N/A';

		this.props.setSurvey( {
			vertical: englishSiteTopicInput,
			otherText: '',
			siteType: designType,
		} );

		//Site Goals
		this.props.setSiteGoals( siteGoalsInput );
		themeRepo = getThemeForSiteGoals( siteGoalsInput );
		designType = getSiteTypeForSiteGoals( siteGoalsInput, this.props.flowName );

		for ( let i = 0; i < siteGoalsArray.length; i++ ) {
			eventAttributes[ `site_goal_${ siteGoalsArray[ i ] }` ] = true;
		}

		eventAttributes.site_goal_selections = siteGoalsGroup;

		//SET SITETYPE
		this.props.setDesignType( designType );
		this.props.recordTracksEvent( 'calypso_triforce_select_design', {
			category: designType,
		} );

		//User Experience
		if ( ! this.props.isLoggedIn && userExperienceInput !== '' ) {
			this.props.setUserExperience( userExperienceInput );
			eventAttributes.user_experience = userExperienceInput;
		}

		this.props.recordTracksEvent( 'calypso_signup_actions_user_input', eventAttributes );

		//Store
		const nextFlowName = designType === DESIGN_TYPE_STORE ? 'store-nux' : this.props.flowName;

		//Pressable
		if (
			designType === DESIGN_TYPE_STORE &&
			abtest( 'signupAtomicStoreVsPressable' ) === 'pressable'
		) {
			this.scrollUp();

			this.setState( {
				showStore: true,
			} );

			invoke( this, 'pressableStore.focus' );

			return;
		}

		//Create site
		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Collecting your information' ),
				stepName: stepName,
			},
			{
				themeSlugWithRepo: themeRepo,
				siteTitle: siteTitleValue,
				designType: designType,
				surveyQuestion: siteTopicInput,
			}
		);

		goToNextStep( nextFlowName );
	};

	renderGoalCheckboxes() {
		const { translate } = this.props;
		// Note that the key attributes will be used in the name of a tracks event attribute so can not
		// contain whitespace.
		const options = {
			shareOption: {
				key: 'share',
				formLabel: translate(
					'Share ideas, experiences, updates, reviews, stories, videos, or photos'
				),
			},
			promoteOption: {
				key: 'promote',
				formLabel: translate( 'Promote your business, skills, organization, or events' ),
			},
			educateOption: {
				key: 'educate',
				formLabel: translate( 'Offer education, training, or mentoring' ),
			},
			sellOption: {
				key: 'sell',
				formLabel: translate( 'Sell products or collect payments' ),
			},
			showcaseOption: {
				key: 'showcase',
				formLabel: translate( 'Showcase your portfolio' ),
			},
		};

		const siteGoalsArray = [
			'shareOption',
			'promoteOption',
			'educateOption',
			'sellOption',
			'showcaseOption',
		];

		return (
			<div className="about__checkboxes">
				{ siteGoalsArray.map( ( item, index ) => {
					return (
						<FormLabel
							htmlFor={ options[ item ].key }
							className="about__checkbox-option"
							key={ options[ item ].key }
						>
							{ 0 === index && (
								<span className="about__screen-reader-text screen-reader-text">
									{ translate( 'What’s the primary goal you have for your site?' ) }
								</span>
							) }
							<FormInputCheckbox
								name="siteGoals"
								id={ options[ item ].key }
								onChange={ this.checkBoxHandleChange }
								defaultChecked={ this.isCheckBoxChecked( options[ item ].key ) }
								value={ options[ item ].key }
								className="about__checkbox"
								onKeyDown={ this.handleCheckboxKeyDown }
							/>
							<span className="about__checkbox-label">{ options[ item ].formLabel }</span>
						</FormLabel>
					);
				} ) }
			</div>
		);
	}

	renderExperienceOptions() {
		const { translate, isLoggedIn } = this.props;

		if ( isLoggedIn ) {
			return null;
		}

		return (
			<FormFieldset className="about__last-fieldset">
				<FormLegend>{ translate( 'How comfortable are you with creating a website?' ) }</FormLegend>
				<div className="about__segmented-control-wrapper">
					<span
						className="about__segment-label about__min-label"
						onClick={ this.handleSegmentClick( 1 ) }
					>
						{ translate( 'Beginner' ) }
					</span>

					<SegmentedControl className="is-primary about__segmented-control">
						<ControlItem
							selected={ this.state.userExperience === 1 }
							onClick={ this.handleSegmentClick( 1 ) }
						>
							<span className="about__screen-reader-text screen-reader-text">
								{ translate( 'How comfortable are you with creating a website?' ) }
							</span>
							1
							<span className="about__screen-reader-text screen-reader-text">
								{ translate( 'Beginner' ) }
							</span>
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
							<span className="about__screen-reader-text screen-reader-text">
								{ translate( 'Expert' ) }
							</span>
						</ControlItem>
					</SegmentedControl>
					<span
						className="about__segment-label about__max-label"
						onClick={ this.handleSegmentClick( 5 ) }
					>
						{ translate( 'Expert' ) }
					</span>
				</div>
			</FormFieldset>
		);
	}

	scrollUp() {
		// Didn't use setInterval in order to fix delayed scroll
		while ( window.pageYOffset > 0 ) {
			window.scrollBy( 0, -10 );
		}
	}

	renderContent() {
		const { translate, siteTitle } = this.props;

		const pressableWrapperClassName = classNames( 'about__pressable-wrapper', {
			'about__wrapper-is-hidden': ! this.state.showStore,
		} );

		const aboutFormClassName = classNames( 'about__form-wrapper', {
			'about__wrapper-is-hidden': this.state.showStore,
		} );

		return (
			<div className="about__wrapper">
				<div className={ pressableWrapperClassName }>
					<PressableStoreStep
						{ ...this.props }
						onBackClick={ this.handleStoreBackClick }
						setRef={ this.setPressableStore }
						isVisible={ this.state.showStore }
					/>
				</div>

				<div className={ aboutFormClassName }>
					<form onSubmit={ this.handleSubmit }>
						<Card>
							<FormFieldset>
								<FormLabel htmlFor="siteTitle">
									{ translate( 'What would you like to name your site?' ) }
								</FormLabel>
								<FormTextInput
									id="siteTitle"
									name="siteTitle"
									placeholder={ translate( "e.g. Mel's Diner, Stevie’s Blog, Vail Renovations" ) }
									defaultValue={ siteTitle }
									onChange={ this.handleChangeEvent }
								/>
							</FormFieldset>

							<FormFieldset>
								<FormLabel htmlFor="siteTopic">
									{ translate( 'What will your site be about?' ) }
								</FormLabel>
								<FormTextInput
									id="siteTopic"
									name="siteTopic"
									placeholder={ translate( 'e.g. Fashion, travel, design, plumber, electrician' ) }
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
								<FormLegend>
									{ translate( 'What’s the primary goal you have for your site?' ) }
								</FormLegend>
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
				headerText={ translate( 'Let’s create a site.' ) }
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
		isLoggedIn: isUserLoggedIn( state ),
	} ),
	{
		setSiteTitle,
		setDesignType,
		setSiteGoals,
		setSurvey,
		setUserExperience,
		recordTracksEvent,
	}
)( localize( AboutStep ) );
