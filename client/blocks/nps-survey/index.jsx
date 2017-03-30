/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
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
		const className = classNames( 'nps-survey', {
			'is-recommendation-selected': Number.isInteger( this.state.score ),
			'is-submitted': this.props.hasAnswered,
		} );

		return (
			<div className={ className }>
				<div className="nps-survey__question-screen">
					<div>How likely is it that you would recommend WordPress.com to your friends, family, or colleagues?</div>
					<div>
						<RecommendationSelect
							value={ this.state.score }
							disabled={ this.props.hasAnswered }
							onChange={ this.handleRecommendationSelectChange }
						/>
					</div>
					<div>
						<Button primary
							className="nps-survey__finish-button"
							disabled={ this.props.hasAnswered }
							onClick={ this.handleFinishClick }
						>
							Finish
						</Button>
						<Button borderless
							disabled={ this.props.hasAnswered }
							onClick={ this.handleDismissClick }
						>
							I'd rather not answer
						</Button>
					</div>
				</div>
				<div className="nps-survey__thank-you-screen">
					Thanks for providing your feedback!
					<div>
						<Button primary
							onClick={ this.props.onClose }
						>
							Dismiss
						</Button>
					</div>
				</div>
		</div>
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

export default connect(
	mapStateToProps,
	{ submitNpsSurvey, submitNpsSurveyWithNoScore }
)( NpsSurvey );
