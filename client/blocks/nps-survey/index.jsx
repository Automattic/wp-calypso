/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import RecommendationSelect from './recommendation-select';
import {
	submitNpsSurvey,
	submitNpsSurveyWithNoScore,
} from 'state/nps-survey/actions';
import {
	isNpsSurveyNotSubmitted,
	isNpsSurveySubmitted,
	isNpsSurveySubmitting,
	isNpsSurveySubmitFailure,
	hasAnsweredNpsSurvey,
} from 'state/nps-survey/selectors';

class NpsSurvey extends Component {
	static propTypes = {
		onDismissed: PropTypes.func,
		name: PropTypes.string
	}

	state = {
		score: null,
	}

	handleRecommendationSelectChange = ( score ) => {
		this.setState( { score } );
	}

	handleFinishClick = () => {
		this.props.submitNpsSurvey( this.props.name, this.state.score );
	}

	handleDismissClick = () => {
		this.props.submitNpsSurveyWithNoScore( this.props.name );
		// allow for the state to propagate
		setTimeout( () => {
			this.props.onClose();
		}, 0 );
	}

	render() {
		const { translate } = this.props;

		const className = classNames( 'nps-survey', {
			'is-recommendation-selected': Number.isInteger( this.state.score ),
			'is-submitted': this.props.hasAnswered,
		} );

		return (
			<Card className={ className }>
				<div className="nps-survey__question-screen">
					<div className="nps-survey__question">
						{ translate( 'How likely are you to recommend WordPress.com to your friends, family, or colleagues?' ) }
					</div>
					<div className="nps-survey__recommendation-select-wrapper">
						<RecommendationSelect
							value={ this.state.score }
							disabled={ this.props.hasAnswered }
							onChange={ this.handleRecommendationSelectChange }
						/>
					</div>
					<div className="nps-survey__buttons">
						<Button primary
							className="nps-survey__finish-button"
							disabled={ this.props.hasAnswered }
							onClick={ this.handleFinishClick }
						>
							{ translate( 'Finish', { context: 'verb' } ) }
						</Button>
						<Button borderless
							className="nps-survey__not-answer-button"
							disabled={ this.props.hasAnswered }
							onClick={ this.handleDismissClick }
						>
							{ translate( 'I\'d rather not answer' ) }
						</Button>
					</div>
				</div>
				<div className="nps-survey__thank-you-screen">
					<div className="nps-survey__thank-you">
						{ translate( 'Thanks for your feedback!' ) }
					</div>
					<div className="nps-survey__buttons">
						<Button primary
							className="nps-survey__dismiss-button"
							onClick={ this.props.onClose }
						>
							Close
						</Button>
					</div>
				</div>
		</Card>
		);
	}
}

const mapStateToProps = ( state ) => {
	return {
		isNotSubmitted: isNpsSurveyNotSubmitted( state ),
		isSubmitting: isNpsSurveySubmitting( state ),
		isSubmitted: isNpsSurveySubmitted( state ),
		isSubmitFailure: isNpsSurveySubmitFailure( state ),
		hasAnswered: hasAnsweredNpsSurvey( state ),
	};
};

export default
	connect(
		mapStateToProps,
		{ submitNpsSurvey, submitNpsSurveyWithNoScore }
	)( localize(
		NpsSurvey
	) );
