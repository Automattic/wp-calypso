/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';
import { find, get } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import analytics from 'lib/analytics';
import verticals from './verticals';
import Button from 'components/button';
import { getStepUrl } from 'signup/utils';
import FormTextInputWithAction from 'components/forms/form-text-input-with-action';
import { setSurvey } from 'state/signup/steps/survey/actions';

class SurveyStep extends React.Component {
	static propTypes = {
		surveySiteType: PropTypes.string,
		setSurvey: PropTypes.func.isRequired,
	};

	static defaultProps = {
		surveySiteType: 'site',
	};

	state = {
		otherWriteIn: '',
		verticalList: verticals.get(),
	};

	getOtherWriteIn = () => {
		return (
			this.state.otherWriteIn ||
			get(
				find( this.props.signupProgress, { stepName: this.props.stepName } ),
				'otherWriteIn',
				''
			)
		);
	};

	renderVertical = vertical => {
		return (
			<Button
				className="survey__vertical"
				key={ vertical.value }
				data-value={ vertical.value }
				data-label={ vertical.label() }
				onClick={ this.handleVerticalButton }
			>
				<span
					className="survey__vertical-label"
					data-value={ vertical.value }
					data-label={ vertical.label() }
				>
					{ vertical.label() }
				</span>
				<Gridicon className="survey__vertical-chevron" icon="chevron-right" />
			</Button>
		);
	};

	renderOther = () => {
		const otherWriteIn = this.getOtherWriteIn();
		return (
			<div className="survey__other">
				<FormTextInputWithAction
					action={ this.props.translate( 'Continue' ) }
					defaultValue={ otherWriteIn }
					placeholder={ this.props.translate( 'Please describe what your site is about' ) }
					onAction={ this.handleVerticalOther }
					onChange={ this.handleOtherWriteIn }
				/>
				<p className="survey__other-copy">
					{ this.props.translate( 'e.g. ’yoga’, ‘classic cars’' ) }
				</p>
			</div>
		);
	};

	renderOptionList = () => {
		return (
			<div className="survey__verticals-list">
				{ this.state.verticalList.map( this.renderVertical ) }
				<Button className="survey__vertical" onClick={ this.handleOther }>
					<span className="survey__vertical-label">{ this.props.translate( 'Other' ) }</span>
					<Gridicon className="survey__vertical-chevron" icon="chevron-right" />
				</Button>
			</div>
		);
	};

	render() {
		const blogHeaderText = this.props.translate( "Let's create your new WordPress.com blog!" );
		const siteHeaderText = this.props.translate( "Let's create your new WordPress.com site!" );
		const blogSubHeaderText = this.props.translate(
			'To get started, tell us what your blog is about.'
		);
		const siteSubHeaderText = this.props.translate(
			'To get started, tell us what your blog or website is about.'
		);

		const backUrl = this.props.stepSectionName
			? getStepUrl( this.props.flowName, this.props.stepName, undefined, this.props.locale )
			: undefined;

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				stepSectionName={ this.props.stepSectionName }
				backUrl={ backUrl }
				positionInFlow={ this.props.positionInFlow }
				headerText={ this.props.surveySiteType === 'blog' ? blogHeaderText : siteHeaderText }
				subHeaderText={
					this.props.surveySiteType === 'blog' ? blogSubHeaderText : siteSubHeaderText
				}
				signupProgress={ this.props.signupProgress }
				stepContent={
					this.props.stepSectionName === 'other' ? this.renderOther() : this.renderOptionList()
				}
			/>
		);
	}

	handleVerticalButton = e => {
		const { value, label } = e.target.dataset;
		this.submitStep( label, value );
	};

	handleOther = () => {
		page( getStepUrl( this.props.flowName, this.props.stepName, 'other', this.props.locale ) );
	};

	handleVerticalOther = otherTextValue => {
		const otherText = otherTextValue.replace( /^\W+|\W+$/g, '' );
		const otherWriteIn = otherText.length !== 0 ? otherText : undefined;

		this.submitStep( 'Uncategorized', 'a8c.24', otherWriteIn );
	};

	handleOtherWriteIn = value => {
		this.setState( {
			otherWriteIn: value.replace( /^\W+|\W+$/g, '' ),
		} );
	};

	submitStep = ( label, value, otherWriteIn = '' ) => {
		analytics.tracks.recordEvent( 'calypso_survey_site_type', { type: this.props.surveySiteType } );
		analytics.tracks.recordEvent( 'calypso_survey_category_chosen', {
			category_id: value,
			category_label: label,
			category_write_in: otherWriteIn,
			survey_version: '2',
		} );

		this.props.setSurvey( {
			vertical: value,
			otherText: otherWriteIn || '',
			siteType: this.props.surveySiteType,
		} );

		SignupActions.submitSignupStep(
			{
				stepName: this.props.stepName,
				stepSectionName: this.props.stepSectionName,
				otherWriteIn: otherWriteIn,
			},
			{ surveySiteType: this.props.surveySiteType, surveyQuestion: value }
		);

		this.props.goToNextStep();
	};
}

export default connect( null, { setSurvey } )( localize( SurveyStep ) );
