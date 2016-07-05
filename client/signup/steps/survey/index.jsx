/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import analytics from 'lib/analytics';
import verticals from './verticals';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import BackButton from 'components/header-cake';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';

function isSurveyOneStep() {
	return false;
}

export default React.createClass( {
	displayName: 'SurveyStep',

	propTypes: {
		isOneStep: React.PropTypes.bool,
		surveySiteType: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			surveySiteType: 'site',
			isOneStep: isSurveyOneStep()
		};
	},

	getInitialState() {
		return {
			stepOne: null,
			stepTwo: [],
			verticalList: verticals.get()
		};
	},

	renderStepTwoVertical( vertical ) {
		const stepTwoClickHandler = ( event ) => {
			event.preventDefault();
			event.stopPropagation();
			this.handleNextStep( vertical );
		};
		return (
			<Card className="survey-step__vertical" key={ vertical.value } href="#" onClick={ stepTwoClickHandler }>
				<label className="survey-step__label">{ vertical.label }</label>
			</Card>
		);
	},

	renderStepOneVertical( vertical ) {
		const icon = vertical.icon || 'user';
		const stepOneClickHandler = ( event ) => {
			event.preventDefault();
			event.stopPropagation();
			if ( this.props.isOneStep ) {
				this.handleNextStep( vertical );
				return;
			}
			this.showStepTwo( vertical );
		};
		return (
			<Card className="survey-step__vertical" key={ 'step-one-' + vertical.value } href="#" onClick={ stepOneClickHandler }>
				<Gridicon icon={ icon } className="survey-step__vertical__icon"/>
				<label className="survey-step__label">{ vertical.label }</label>
			</Card>
		);
	},

	renderOptionList() {
		const blogLabel = this.translate( 'What is your blog about?' );
		const siteLabel = this.translate( 'What is your website about?' );

		let verticalsClasses = classNames(
				'survey-step__verticals',
				{ active: ! this.state.stepOne } );

		let subVerticalsClasses = classNames(
				'survey-step__sub-verticals',
				{ active: this.state.stepOne } );

		return (
			<div className="survey-step__wrapper">
				<div className="survey-step__verticals-wrapper">
					<div className={ verticalsClasses }>
						<CompactCard className="survey-step__question">
							<label>{ this.props.surveySiteType === 'blog' ? blogLabel : siteLabel }</label>
						</CompactCard>
						{ this.state.verticalList.map( this.renderStepOneVertical ) }
					</div>

					<Card className={ subVerticalsClasses }>
						<BackButton isCompact className="survey-step__title" onClick={ this.showStepOne }>{ this.state.stepOne && this.state.stepOne.label }</BackButton>
						{ this.state.stepTwo.map( this.renderStepTwoVertical ) }
					</Card>
				</div>
			</div>
		);
	},

	render() {
		const blogHeaderText = this.translate( 'Create your blog today!' );
		const siteHeaderText = this.translate( 'Create your site today!' );
		return (
			<div className="survey-step__section-wrapper">
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ this.props.surveySiteType === 'blog' ? blogHeaderText : siteHeaderText }
					subHeaderText={ this.translate( 'WordPress.com is the best place for your WordPress blog or website.' ) }
					signupProgressStore={ this.props.signupProgressStore }
					stepContent={ this.renderOptionList() } />
			</div>
		);
	},

	showStepOne() {
		const { value, label } = this.state.stepOne;
		analytics.tracks.recordEvent( 'calypso_survey_category_back_click', {
			category_id: value,
			category_label: label
		} );
		this.setState( { stepOne: null } );
	},

	showStepTwo( stepOne ) {
		const { value, label } = stepOne;
		analytics.tracks.recordEvent( 'calypso_survey_category_click_level_one', {
			category_id: value,
			category_label: label
		} );
		this.setState( { stepOne, stepTwo: stepOne.stepTwo } );
	},

	handleNextStep( vertical ) {
		const { value, label } = vertical;
		analytics.tracks.recordEvent( 'calypso_survey_site_type', { type: this.props.surveySiteType } );
		analytics.tracks.recordEvent( 'calypso_survey_category_chosen', {
			category_id: value,
			category_label: label
		} );
		if ( this.state.stepOne ) {
			analytics.tracks.recordEvent( 'calypso_survey_category_click_level_two', {
				category_id: value,
				category_label: label
			} );
			SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], { surveySiteType: this.props.surveySiteType, surveyQuestion: this.state.stepOne.value } );
		} else {
			analytics.tracks.recordEvent( 'calypso_survey_category_click_level_one', {
				category_id: value,
				category_label: label
			} );
			SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], { surveySiteType: this.props.surveySiteType, surveyQuestion: vertical.value } );
		}
		this.props.goToNextStep();
	}
} );
