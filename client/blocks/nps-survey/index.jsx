/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import RecommendationSelect from './recommendation-select';

class NpsSurvey extends Component {
	static propTypes = {
		onDismissed: PropTypes.func,
		name: PropTypes.string
	}

	constructor( props ) {
		super( props );
		this.state = {
			recommendationValue: null,
			isSubmitting: false,
			isSubmitted: false
		};
		this.handleRecommendationSelectChange = this.handleRecommendationSelectChange.bind( this );
		this.handleFinishClick = this.handleFinishClick.bind( this );
		this.handleDismissClick = this.handleDismissClick.bind( this );
	}

	handleRecommendationSelectChange( newRecommendationValue ) {
		this.setState( {
			recommendationValue: newRecommendationValue
		} );
	}

	handleFinishClick() {
		// TODO: fire Redux action and use Redux state tree to determine when
		// survey has been submitted
		this.setState( {
			isSubmitting: true
		} );

		// simulate requestresponse time
		setTimeout( () => {
			this.setState( {
				isSubmitted: true
			} );
		}, 500 );
	}

	handleDismissClick() {
		// TODO: fire Redux action and use Redux state tree to determine
		// if survey has been dismissed

		this.props.onDismissed( {
			wasSubmitted: this.state.isSubmitted,
			surveyName: this.props.name,
			recommendationValue: this.state.recommendationValue
		} );
	}

	render() {
		const className = classNames( 'nps-survey', {
			'is-recommendation-selected': Number.isInteger( this.state.recommendationValue ),
			'is-submitting': this.state.isSubmitting,
			'is-submitted': this.state.isSubmitted
		} );

		return (
			<div className={ className }>
				<div className="nps-survey__question-screen">
					<div>How likely is it that you would recommend WordPress.com to your friends, family, or colleagues?</div>
					<div>
						<RecommendationSelect
							value={ this.state.recommendationValue }
							disabled={ this.state.isSubmitting }
							onChange={ this.handleRecommendationSelectChange }
						/>
					</div>
					<div>
						<Button primary
							className="nps-survey__finish-button"
							disabled={ this.state.isSubmitting }
							onClick={ this.handleFinishClick }
						>
							Finish
						</Button>
						<Button borderless
							disabled={ this.state.isSubmitting }
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
							onClick={ this.handleDismissClick }
						>
							Dismiss
						</Button>
					</div>
				</div>
		</div>
		);
	}
}

export default NpsSurvey;
