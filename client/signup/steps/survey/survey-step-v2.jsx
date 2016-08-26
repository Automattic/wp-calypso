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
import Button from 'components/button';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'SurveyStepV2',

	propTypes: {
		surveySiteType: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			surveySiteType: 'site'
		};
	},

	getInitialState() {
		return {
			verticalList: verticals.get()
		};
	},

	renderVertical( vertical ) {
		return (
			<Button className="survey__vertical" onClick={ this.handleNextStep }>
				<span className="survey__vertical-label">{ vertical.label }</span>
				<Gridicon className="survey__vertical-chevron" icon="chevron-right" />
			</Button>
		);
	},

	renderOptionList() {
		return (
			<div className="survey__verticals-list">
				{ this.state.verticalList.map( this.renderVertical ) }
			</div>
		);
	},

	render() {
		const blogHeaderText = this.translate( 'Create your blog today!' );
		const siteHeaderText = this.translate( 'Create your site today!' );
		return (
			<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ this.props.surveySiteType === 'blog' ? blogHeaderText : siteHeaderText }
					subHeaderText={ this.translate( 'WordPress.com is the best place for your WordPress blog or website.' ) }
					signupProgressStore={ this.props.signupProgressStore }
					stepContent={ this.renderOptionList() } />
		);
	},

	handleNextStep( vertical ) {
		const { value, label } = vertical;
		analytics.tracks.recordEvent( 'calypso_survey_site_type', { type: this.props.surveySiteType } );
		analytics.tracks.recordEvent( 'calypso_survey_category_chosen', {
			category_id: value,
			category_label: label
		} );
		SignupActions.submitSignupStep(
			{ stepName: this.props.stepName },
			[],
			{ surveySiteType: this.props.surveySiteType, surveyQuestion: vertical.value }
		);
		this.props.goToNextStep();
	}
} );
