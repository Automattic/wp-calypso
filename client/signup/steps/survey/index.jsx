import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { find, get } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormTextInputWithAction from 'calypso/components/forms/form-text-input-with-action';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSignupProgress } from 'calypso/state/signup/progress/selectors';
import { setSurvey } from 'calypso/state/signup/steps/survey/actions';
import verticals from './verticals';
import './style.scss';

class SurveyStep extends Component {
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

	getOtherWriteIn() {
		return (
			this.state.otherWriteIn ||
			get(
				find( this.props.signupProgress, { stepName: this.props.stepName } ),
				'otherWriteIn',
				''
			)
		);
	}

	renderVertical = ( vertical ) => {
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

	renderOther() {
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
	}

	renderOptionList() {
		return (
			<div className="survey__verticals-list">
				{ this.state.verticalList.map( this.renderVertical ) }
				<Button className="survey__vertical" onClick={ this.handleOther }>
					<span className="survey__vertical-label">{ this.props.translate( 'Other' ) }</span>
					<Gridicon className="survey__vertical-chevron" icon="chevron-right" />
				</Button>
			</div>
		);
	}

	render() {
		const blogHeaderText = this.props.translate( "Let's create your new WordPress.com blog!" );
		const siteHeaderText = this.props.translate( "Let's create your new WordPress.com site!" );
		const blogSubHeaderText = this.props.translate(
			'To get started, tell us what your blog is about.'
		);
		const siteSubHeaderText = this.props.translate(
			'To get started, tell us what your blog or website is about.'
		);

		const locale = ! this.props.userLoggedIn ? this.props.locale : '';
		const backUrl = this.props.stepSectionName
			? getStepUrl( this.props.flowName, this.props.stepName, undefined, locale )
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
				stepContent={
					this.props.stepSectionName === 'other' ? this.renderOther() : this.renderOptionList()
				}
			/>
		);
	}

	handleVerticalButton = ( e ) => {
		const { value, label } = e.target.dataset;
		this.submitStep( label, value );
	};

	handleOther = () => {
		const locale = ! this.props.userLoggedIn ? this.props.locale : '';
		page( getStepUrl( this.props.flowName, this.props.stepName, 'other', locale ) );
	};

	handleVerticalOther = ( otherTextValue ) => {
		const otherText = otherTextValue.replace( /^\W+|\W+$/g, '' );
		const otherWriteIn = otherText.length !== 0 ? otherText : undefined;

		this.submitStep( 'Uncategorized', 'a8c.24', otherWriteIn );
	};

	handleOtherWriteIn = ( value ) => {
		this.setState( {
			otherWriteIn: value.replace( /^\W+|\W+$/g, '' ),
		} );
	};

	submitStep = ( label, value, otherWriteIn = '' ) => {
		recordTracksEvent( 'calypso_survey_site_type', { type: this.props.surveySiteType } );
		recordTracksEvent( 'calypso_survey_category_chosen', {
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

		this.props.submitSignupStep(
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

export default connect(
	( state ) => ( {
		userLoggedIn: isUserLoggedIn( state ),
		signupProgress: getSignupProgress( state ),
	} ),
	{ setSurvey, submitSignupStep }
)( localize( SurveyStep ) );
