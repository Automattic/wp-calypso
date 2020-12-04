/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { noop, includes } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'calypso/signup/step-wrapper';
import formState from 'calypso/lib/form-state';
import { setSiteTitle } from 'calypso/state/signup/steps/site-title/actions';
import { setDesignType } from 'calypso/state/signup/steps/design-type/actions';
import { getSiteTitle } from 'calypso/state/signup/steps/site-title/selectors';
import { setSiteGoals } from 'calypso/state/signup/steps/site-goals/actions';
import { getSiteGoals } from 'calypso/state/signup/steps/site-goals/selectors';
import { setUserExperience } from 'calypso/state/signup/steps/user-experience/actions';
import { getUserExperience } from 'calypso/state/signup/steps/user-experience/selectors';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getThemeForSiteGoals, getDesignTypeForSiteGoals } from 'calypso/signup/utils';
import { setSurvey } from 'calypso/state/signup/steps/survey/actions';
import { getSurveyVertical } from 'calypso/state/signup/steps/survey/selectors';
import { isValidLandingPageVertical } from 'calypso/lib/signup/verticals';
import { DESIGN_TYPE_STORE } from 'calypso/signup/constants';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSiteTypePropertyValue } from 'calypso/lib/signup/site-type';
import {
	getSiteVerticalId,
	getSiteVerticalParentId,
} from 'calypso/state/signup/steps/site-vertical/selectors';
import { setSiteVertical } from 'calypso/state/signup/steps/site-vertical/actions';
import hasInitializedSites from 'calypso/state/selectors/has-initialized-sites';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';

//Form components
import { Card, Button, ScreenReaderText } from '@automattic/components';
import FormTextInput from 'calypso/components/forms/form-text-input';
import InfoPopover from 'calypso/components/info-popover';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import SegmentedControl from 'calypso/components/segmented-control';
import SiteVerticalsSuggestionSearch from 'calypso/components/site-verticals-suggestion-search';

/**
 * Style dependencies
 */
import './style.scss';

class AboutStep extends Component {
	constructor( props ) {
		super( props );
		this._isMounted = false;
		const hasPrepopulatedVertical =
			isValidLandingPageVertical( props.siteTopic ) &&
			props.queryObject.vertical === props.siteTopic;

		this.state = {
			verticalId: props.verticalId,
			verticalParentId: props.verticalParentId,
			siteTopicValue: props.siteTopic,
			userExperience: props.userExperience,
			pendingStoreClick: false,
			hasPrepopulatedVertical,
		};
	}

	componentDidMount() {
		this._isMounted = true;
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

		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	setFormState = ( state ) => this._isMounted && this.setState( { form: state } );

	onSiteTopicChange = ( { parent, verticalId, verticalName, verticalSlug } ) => {
		const verticalParentId = parent || verticalId;
		this.setState( {
			verticalId: verticalId,
			siteTopicValue: verticalName,
			siteTopicSlug: verticalSlug,
			verticalParentId,
		} );

		this.props.recordTracksEvent( 'calypso_signup_actions_select_site_topic', {
			vertical_name: verticalName,
			parent_id: verticalParentId,
		} );
		this.formStateController.handleFieldChange( {
			name: 'siteTopic',
			value: verticalName,
		} );
	};

	handleChangeEvent = ( event ) => {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value,
		} );
	};

	checkBoxHandleChange = ( event ) => {
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

	handleCheckboxKeyDown = ( event ) => {
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
		return function () {
			this.setState( {
				userExperience: value,
			} );
		}.bind( this );
	}

	handleSubmit = ( event ) => {
		event.preventDefault();
		const {
			goToNextStep,
			stepName,
			flowName,
			shouldHideSiteTitle,
			shouldHideSiteGoals,
			previousFlowName,
			siteType,
		} = this.props;

		//Defaults
		let themeRepo = 'pub/radcliffe-2';
		let designType = 'blog';
		let siteTitleValue = 'Site Title';
		let nextFlowName = flowName;

		//Inputs
		const userExperienceInput = this.state.userExperience;
		const siteTopicInput = formState.getFieldValue( this.state.form, 'siteTopic' );
		const eventAttributes = {};

		if ( ! shouldHideSiteTitle ) {
			//Site Title
			const siteTitleInput = formState.getFieldValue( this.state.form, 'siteTitle' );
			if ( siteTitleInput !== '' ) {
				siteTitleValue = siteTitleInput;
				this.props.setSiteTitle( siteTitleValue );
			}
			eventAttributes.site_title = siteTitleInput || 'N/A';
		}

		// Set Site Topic value for tracking/marketing
		eventAttributes.site_topic = this.state.hasPrepopulatedVertical
			? this.state.siteTopicValue
			: this.state.siteTopicSlug || siteTopicInput;

		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_topic', {
			value: eventAttributes.site_topic || 'N/A',
		} );

		this.props.setSurvey( {
			vertical: eventAttributes.site_topic,
			otherText: '',
			siteType: designType,
		} );

		// Update the vertical state tree used for onboarding flows
		// to maintain consistency
		this.props.setSiteVertical( {
			id: this.state.verticalId,
			name: this.state.siteTopicValue,
			slug: this.state.siteTopicSlug,
			isUserInput: ! this.state.verticalId,
			parentId: this.state.verticalParentId,
		} );

		//Site Goals
		if ( shouldHideSiteGoals ) {
			themeRepo =
				getSiteTypePropertyValue( 'slug', siteType, 'theme' ) || 'pub/independent-publisher-2';

			if ( 'ecommerce' === flowName ) {
				designType = 'page';
			} else {
				designType = getSiteTypePropertyValue( 'slug', siteType, 'designType' ) || 'blog';
			}

			eventAttributes.site_type = siteType;
		} else {
			const siteGoalsInput = formState.getFieldValue( this.state.form, 'siteGoals' );
			const siteGoalsArray = siteGoalsInput.split( ',' );
			const siteGoalsGroup = siteGoalsArray.sort().join();

			this.props.setSiteGoals( siteGoalsInput );
			themeRepo = this.state.hasPrepopulatedVertical
				? 'pub/radcliffe-2'
				: getThemeForSiteGoals( siteGoalsInput );
			designType = getDesignTypeForSiteGoals( siteGoalsInput, flowName );

			for ( let i = 0; i < siteGoalsArray.length; i++ ) {
				eventAttributes[ `site_goal_${ siteGoalsArray[ i ] }` ] = true;
			}

			eventAttributes.site_goal_selections = siteGoalsGroup;

			//Store
			if ( designType === DESIGN_TYPE_STORE ) {
				nextFlowName =
					siteGoalsArray.indexOf( 'sell' ) === -1 && previousFlowName
						? previousFlowName
						: 'ecommerce';
			}
		}

		//SET DESIGN TYPE
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

		//Create site
		this.props.submitSignupStep(
			{ stepName },
			{
				themeSlugWithRepo: themeRepo,
				siteTitle: siteTitleValue,
				designType,
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
								<ScreenReaderText>
									{ translate( 'What’s the primary goal you have for your site?' ) }
								</ScreenReaderText>
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
		/* eslint-disable jsx-a11y/click-events-have-key-events */
		/* eslint-disable jsx-a11y/no-static-element-interactions */
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
						<SegmentedControl.Item
							selected={ this.state.userExperience === 1 }
							onClick={ this.handleSegmentClick( 1 ) }
						>
							<ScreenReaderText>
								{ translate( 'How comfortable are you with creating a website?' ) }
							</ScreenReaderText>
							1<ScreenReaderText>{ translate( 'Beginner' ) }</ScreenReaderText>
						</SegmentedControl.Item>

						<SegmentedControl.Item
							selected={ this.state.userExperience === 2 }
							onClick={ this.handleSegmentClick( 2 ) }
						>
							2
						</SegmentedControl.Item>

						<SegmentedControl.Item
							selected={ this.state.userExperience === 3 }
							onClick={ this.handleSegmentClick( 3 ) }
						>
							3
						</SegmentedControl.Item>

						<SegmentedControl.Item
							selected={ this.state.userExperience === 4 }
							onClick={ this.handleSegmentClick( 4 ) }
						>
							4
						</SegmentedControl.Item>

						<SegmentedControl.Item
							selected={ this.state.userExperience === 5 }
							onClick={ this.handleSegmentClick( 5 ) }
						>
							5<ScreenReaderText>{ translate( 'Expert' ) }</ScreenReaderText>
						</SegmentedControl.Item>
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
		/* eslint-enable jsx-a11y/click-events-have-key-events */
		/* eslint-enable jsx-a11y/no-static-element-interactions */
	}

	scrollUp() {
		// Didn't use setInterval in order to fix delayed scroll
		while ( window.pageYOffset > 0 ) {
			window.scrollBy( 0, -10 );
		}
	}

	shouldShowSiteTopicField() {
		const { steps } = this.props;
		const { hasPrepopulatedVertical } = this.state;

		return ! hasPrepopulatedVertical && ! includes( steps, 'site-topic' );
	}

	renderContent() {
		const { translate, siteTitle, shouldHideSiteTitle, shouldHideSiteGoals } = this.props;

		const { siteTopicValue } = this.state;

		return (
			<div className="about__wrapper">
				<div className="about__form-wrapper">
					<form onSubmit={ this.handleSubmit }>
						<Card>
							{ ! shouldHideSiteTitle && (
								<FormFieldset>
									<FormLabel htmlFor="siteTitle">
										{ translate( 'What would you like to name your site?' ) }
										<InfoPopover className="about__info-popover" position="top">
											{ translate(
												"We'll use this as your site title. " +
													"Don't worry, you can change this later."
											) }
										</InfoPopover>
									</FormLabel>
									<FormTextInput
										id="siteTitle"
										name="siteTitle"
										placeholder={ translate(
											"E.g., Mel's Diner, Stevie’s Blog, Vail Renovations"
										) }
										defaultValue={ siteTitle }
										onChange={ this.handleChangeEvent }
									/>
								</FormFieldset>
							) }

							{ this.shouldShowSiteTopicField() && (
								<FormFieldset>
									<FormLabel htmlFor="siteTopic">
										{ translate( 'What will your site be about?' ) }
										<InfoPopover className="about__info-popover" position="top">
											{ translate( "We'll use this to personalize your site and experience." ) }
										</InfoPopover>
									</FormLabel>
									<SiteVerticalsSuggestionSearch
										onChange={ this.onSiteTopicChange }
										searchValue={ siteTopicValue }
									/>
								</FormFieldset>
							) }

							{ ! shouldHideSiteGoals && (
								<FormFieldset>
									<FormLegend>
										{ translate( 'What’s the primary goal you have for your site?' ) }
									</FormLegend>
									{ this.renderGoalCheckboxes() }
								</FormFieldset>
							) }

							{ this.renderExperienceOptions() }

							<div className="about__submit-wrapper">
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
		const {
			flowName,
			positionInFlow,
			stepName,
			translate,
			hasInitializedSitesBackUrl,
		} = this.props;
		const headerText = translate( 'Let’s create a site.' );
		const subHeaderText = translate(
			'Please answer these questions so we can help you make the site you need.'
		);

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				stepContent={ this.renderContent() }
				allowBackFirstStep={ !! hasInitializedSitesBackUrl }
				backUrl={ hasInitializedSitesBackUrl }
				backLabelText={ hasInitializedSitesBackUrl ? translate( 'Back to My Sites' ) : null }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		siteTitle: getSiteTitle( state ),
		siteGoals: getSiteGoals( state ),
		siteTopic: getSurveyVertical( state ),
		userExperience: getUserExperience( state ),
		siteType: getSiteType( state ),
		isLoggedIn: isUserLoggedIn( state ),
		verticalId: getSiteVerticalId( state ),
		verticalParentId: getSiteVerticalParentId( state ),
		shouldHideSiteGoals:
			'onboarding' === ownProps.flowName && includes( ownProps.steps, 'site-type' ),
		shouldHideSiteTitle:
			'onboarding' === ownProps.flowName && includes( ownProps.steps, 'site-title' ),
		shouldSkipAboutStep:
			includes( ownProps.steps, 'site-type' ) &&
			includes( ownProps.steps, 'site-topic' ) &&
			includes( ownProps.steps, 'site-title' ),
		hasInitializedSitesBackUrl: hasInitializedSites( state ) ? '/sites/' : false,
	} ),
	{
		setSiteTitle,
		setDesignType,
		setSiteGoals,
		setSurvey,
		setUserExperience,
		recordTracksEvent,
		setSiteVertical,
		saveSignupStep,
		submitSignupStep,
	}
)( localize( AboutStep ) );
