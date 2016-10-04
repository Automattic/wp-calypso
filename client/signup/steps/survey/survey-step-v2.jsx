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
import TextInput from 'components/forms/form-text-input';

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
			shouldShowOther: false,
			otherWriteIn: '',
			verticalList: verticals.get(),
		};
	},

	renderVertical( vertical ) {
		return (
			<Button
				className="survey__vertical"
				key={ vertical.value }
				data-value={ vertical.value }
				data-label={ vertical.label }
				onClick={ this.handleNextStep }
			>
				<span className="survey__vertical-label">{ vertical.label }</span>
				<Gridicon className="survey__vertical-chevron" icon="chevron-right" />
			</Button>
		);
	},

	renderOther() {
		return (
			<div className="survey__other">
				<TextInput className="survey__other-write-in"
					placeholder={ this.translate( 'Please describe what your site is about' ) }
					onChange={ this.handleOtherWriteIn }
					ref={ ( input ) => input && input.focus() } />
				<Button className="survey__other-button" primary compact
					disabled={ this.state.otherWriteIn.length === 0 }
					data-value="a8c.24"
					data-label="Uncategorized"
					onClick={ this.handleNextStep }
				>
					{ this.translate( 'Continue' ) }
				</Button>
				<p className="survey__other-copy">{ this.translate( 'e.g. ’yoga’, ‘classic cars’' ) }</p>
			</div>
		);
	},

	renderOptionList() {
		return (
			<div className="survey__verticals-list">
				{ this.state.verticalList.map( this.renderVertical ) }
				<Button className="survey__vertical" onClick={ this.handleOther }>
					<span className="survey__vertical-label">{ this.translate( 'Other' ) }</span>
					<Gridicon className="survey__vertical-chevron" icon="chevron-right" />
				</Button>
			</div>
		);
	},

	render() {
		const blogHeaderText = this.translate( 'Let\'s create your new WordPress.com blog!' );
		const siteHeaderText = this.translate( 'Let\'s create your new WordPress.com site!' );
		const blogSubHeaderText = this.translate( 'To get started, tell us what your blog is about.' );
		const siteSubHeaderText = this.translate( 'To get started, tell us what your site is about.' );
		return (
			<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ this.props.surveySiteType === 'blog' ? blogHeaderText : siteHeaderText }
					subHeaderText={ this.props.surveySiteType === 'blog' ? blogSubHeaderText : siteSubHeaderText }
					signupProgressStore={ this.props.signupProgressStore }
					stepContent={ this.state.shouldShowOther ? this.renderOther() : this.renderOptionList() } />
		);
	},

	handleOtherWriteIn( e ) {
		this.setState( {
			otherWriteIn: e.target.value
		} );
	},

	handleOther() {
		this.setState( {
			shouldShowOther: true
		} );
	},

	handleNextStep( e ) {
		const { value, label } = e.target.dataset;
		analytics.tracks.recordEvent( 'calypso_survey_site_type', { type: this.props.surveySiteType } );
		analytics.tracks.recordEvent( 'calypso_survey_category_chosen', {
			category_id: value,
			category_label: label,
			category_write_in: ( this.state.otherWriteIn.length !== 0 ? this.state.otherWriteIn : undefined ),
			survey_version: '2',
		} );
		SignupActions.submitSignupStep(
			{ stepName: this.props.stepName },
			[],
			{ surveySiteType: this.props.surveySiteType, surveyQuestion: value }
		);
		this.props.goToNextStep();
	}
} );
