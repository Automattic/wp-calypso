/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { noop, trim } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormTextArea from 'components/forms/form-textarea';
import ScreenReaderText from 'components/screen-reader-text';
import RecommendationSelect from './recommendation-select';
import {
	submitNpsSurvey,
	submitNpsSurveyWithNoScore,
	sendNpsSurveyFeedback,
} from 'state/nps-survey/actions';
import { successNotice } from 'state/notices/actions';
import { hasAnsweredNpsSurvey } from 'state/nps-survey/selectors';
import analytics from 'lib/analytics';

class NpsSurvey extends Component {
	static propTypes = {
		onClose: PropTypes.func,
		name: PropTypes.string,
	};

	state = {
		score: null,
		feedback: '',
		showFeedbackForm: false,
	};

	handleRecommendationSelectChange = score => {
		this.setState( { score } );
	};

	handleFinishClick = () => {
		this.props.submitNpsSurvey( this.props.name, this.state.score );
		this.setState( { showFeedbackForm: true } );
	};

	handleDismissClick = () => {
		if ( ! this.props.hasAnswered ) {
			this.props.submitNpsSurveyWithNoScore( this.props.name );
		}
		this.onClose( noop );
	};

	handleTextBoxChange = event => {
		this.setState( { feedback: trim( event.target.value ) } );
	};

	handleSendFeedbackClick = () => {
		this.props.sendNpsSurveyFeedback( this.props.name, this.state.feedback );
		this.onClose( this.showThanksNotice );
	};

	handleFeedbackFormClose = () => {
		this.onClose( this.showThanksNotice );
	};

	showThanksNotice = () => {
		this.props.successNotice( this.props.translate( 'Thanks for your feedback!' ), {
			duration: 5000,
		} );
	};

	onClose = afterClose => {
		// ensure that state is updated before onClose handler is called
		setTimeout( () => {
			this.props.onClose( afterClose );
		}, 0 );
	};

	componentWillMount() {
		analytics.mc.bumpStat( 'calypso_nps_survey', 'survey_displayed' );
		analytics.tracks.recordEvent( 'calypso_nps_survey_displayed' );
	}

	renderScoreForm() {
		const { translate } = this.props;

		return (
			<Fragment>
				<div className="nps-survey__question">
					{ translate(
						'How likely are you to recommend WordPress.com to your friends, family, or colleagues?'
					) }
				</div>
				<div className="nps-survey__recommendation-select-wrapper">
					<RecommendationSelect
						value={ this.state.score }
						disabled={ this.props.hasAnswered }
						onChange={ this.handleRecommendationSelectChange }
					/>
				</div>
				<div className="nps-survey__buttons">
					<Button
						primary
						className="nps-survey__finish-button"
						disabled={ this.props.hasAnswered }
						onClick={ this.handleFinishClick }
					>
						{ translate( 'Submit' ) }
					</Button>
					<Button
						borderless
						className="nps-survey__not-answer-button"
						disabled={ this.props.hasAnswered }
						onClick={ this.handleDismissClick }
					>
						{ translate( 'Close' ) }
					</Button>
				</div>
			</Fragment>
		);
	}

	renderFeedbackForm() {
		const { translate } = this.props;

		return (
			<Fragment>
				<div className="nps-survey__question">
					{ translate( 'What is the most important reason for your score?' ) }
				</div>
				<div className="nps-survey__recommendation-select-wrapper">
					<FormTextArea
						onChange={ this.handleTextBoxChange }
						placeholder={ translate( 'Please input your thoughts here' ) }
					/>
				</div>
				<div className="nps-survey__buttons">
					<Button
						primary
						className="nps-survey__finish-button"
						disabled={ ! this.state.feedback }
						onClick={ this.handleSendFeedbackClick }
					>
						{ translate( 'Submit' ) }
					</Button>
					<Button
						borderless
						className="nps-survey__not-answer-button"
						onClick={ this.handleFeedbackFormClose }
					>
						{ translate( 'Close' ) }
					</Button>
				</div>
			</Fragment>
		);
	}

	render() {
		const { translate } = this.props;
		const className = classNames( 'nps-survey', {
			'is-recommendation-selected': Number.isInteger( this.state.score ),
			'is-submitted': this.props.hasAnswered,
		} );

		return (
			<Card className={ className }>
				<Button
					borderless
					className="nps-survey__close-button"
					onClick={
						this.state.showFeedbackForm ? this.handleFeedbackFormClose : this.handleDismissClick
					}
				>
					<Gridicon icon="cross" />
					<ScreenReaderText>{ translate( 'Close' ) }</ScreenReaderText>
				</Button>
				<div className="nps-survey__question-screen">
					{ this.state.showFeedbackForm ? this.renderFeedbackForm() : this.renderScoreForm() }
				</div>
			</Card>
		);
	}
}

const mapStateToProps = state => {
	return {
		hasAnswered: hasAnsweredNpsSurvey( state ),
	};
};

export default connect(
	mapStateToProps,
	{
		submitNpsSurvey,
		submitNpsSurveyWithNoScore,
		sendNpsSurveyFeedback,
		successNotice,
	}
)( localize( NpsSurvey ) );
