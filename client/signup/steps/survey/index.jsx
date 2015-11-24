/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';

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

const debug = debugFactory( 'calypso:steps:survey' );

export default React.createClass( {
	displayName: 'SurveyStep',

	getInitialState() {
		return {
			stepOne: null
		}
	},

	renderStepTwoVertical( vertical ) {
		const verticalLink = '#';
		return (
			<Card className="survey-step__vertical" href={ verticalLink } onClick={ this.handleNextStep.bind( null, vertical ) }>
				<label className="survey-step__label">{ vertical.label }</label>
			</Card>
		);
	},

	renderStepOneVertical( vertical ) {
		const verticalLink = '#';
		return (
			<Card className="survey-step__vertical" href={ verticalLink } onClick={ this.showStepTwo.bind( null, vertical ) }>
				<label className="survey-step__label">{ vertical.label }</label>
			</Card>
		);
	},

	renderOptionList() {
		if ( this.state.stepOne ) {
			return (
				<div>
					<BackButton isCompact className="survey-step__title" onClick={ this.showStepOne }>{ this.state.stepOne.label }</BackButton>
					{ this.state.stepOne.stepTwo.map( this.renderStepTwoVertical ) }
				</div>
			);
		}
		return (
			<div>
				<CompactCard className="survey-step__title">
					<label className="survey-step__label">{ this.translate( 'What is your website about?' ) }</label>
				</CompactCard>
				{ verticals.get().map( this.renderStepOneVertical ) }
			</div>
		);
	},

	render() {
		debug( this.props.stepSectionName );
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
		// TODO: track this event
		this.setState( { stepOne: null } );
	},

	showStepTwo( stepOne ) {
		// TODO: track this event
		this.setState( { stepOne } );
	},

	handleNextStep( vertical ) {
		analytics.tracks.recordEvent( 'calypso_survey_site_type', { type: this.props.surveySiteType } );
		analytics.tracks.recordEvent( 'calypso_survey_v2', { category: JSON.stringify( vertical ) } );
		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], { surveySiteType: this.props.surveySiteType, surveyQuestion: this.state.vertical } );
		this.props.goToNextStep();
	}
} );
