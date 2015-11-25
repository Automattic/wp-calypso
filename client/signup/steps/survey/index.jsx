/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import shuffle from 'lodash/collection/shuffle';
import find from 'lodash/collection/find';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import analytics from 'analytics';
import verticals from './verticals';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import BackButton from 'components/header-cake';
import Gridicon from 'components/gridicon';

const debug = debugFactory( 'calypso:steps:survey' );

export default React.createClass( {
	displayName: 'SurveyStep',

	getInitialState() {
		return {
			stepOne: null,
			verticalList: shuffle( verticals.get() )
		}
	},

	/**
	 * Shuffle an array of verticals, but put the General vertical last.
	 *
	 * @param {Array} elements - the array of vertical elements to shuffle.
	 * @returns {Array} the shuffled array of elements.
	*/
	shuffleVerticals( elements ) {
		const newVerticals = shuffle( elements );
		const general = find( newVerticals, vertical => vertical.isGeneral );
		newVerticals.splice( newVerticals.indexOf( general ), 1 );
		if ( general ) {
			newVerticals.push( general );
		}
		debug( 'shuffling elements', elements, 'becomes', newVerticals );
		return newVerticals;
	},

	renderStepTwoVertical( vertical ) {
		return (
			<Card className="survey-step__vertical" key={ vertical.value } href="#" onClick={ this.handleNextStep.bind( null, vertical ) }>
				<label className="survey-step__label">{ vertical.label }</label>
			</Card>
		);
	},

	renderStepOneVertical( vertical ) {
		const icon = vertical.icon || 'user';
		return (
			<Card className="survey-step__vertical" key={ 'step-one-' + vertical.value } href="#" onClick={ this.showStepTwo.bind( null, vertical ) }>
				<Gridicon icon={ icon } className="survey-step__vertical__icon"/>
				<label className="survey-step__label">{ vertical.label }</label>
			</Card>
		);
	},

	renderOptionList() {
		if ( this.state.stepOne ) {
			return (
				<div>
					<BackButton isCompact className="survey-step__title" onClick={ this.showStepOne }>{ this.state.stepOne.label }</BackButton>
					{ this.shuffleVerticals( this.state.stepOne.stepTwo ).map( this.renderStepTwoVertical ) }
				</div>
			);
		}
		return (
			<div>
				<CompactCard className="survey-step__title">
					<label className="survey-step__label">{ this.translate( 'What is your website about?' ) }</label>
				</CompactCard>
				{ this.state.verticalList.map( this.renderStepOneVertical ) }
			</div>
		);
	},

	render() {
		return (
			<div className="survey-step__section-wrapper">
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ this.translate( 'Create your site today!' ) }
					subHeaderText={ this.translate( 'WordPress.com is the best place for your WordPress blog or website.' ) }
					signupProgressStore={ this.props.signupProgressStore }
					stepContent={ this.renderOptionList() } />
			</div>
		);
	},

	showStepOne() {
		const { value, label } = this.state.stepOne;
		analytics.tracks.recordEvent( 'calypso_survey_category_back_click', { category: JSON.stringify( { value, label } ) } );
		this.setState( { stepOne: null } );
	},

	showStepTwo( stepOne ) {
		const { value, label } = stepOne;
		analytics.tracks.recordEvent( 'calypso_survey_category_click_level_one', { category: JSON.stringify( { value, label } ) } );
		this.setState( { stepOne } );
	},

	handleNextStep( vertical ) {
		analytics.tracks.recordEvent( 'calypso_survey_site_type', { type: this.props.surveySiteType } );
		analytics.tracks.recordEvent( 'calypso_survey_category_click_level_two', { category: JSON.stringify( vertical ) } );
		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], { surveySiteType: this.props.surveySiteType, surveyQuestion: vertical.value } );
		this.props.goToNextStep();
	}
} );
