import { localize, LocalizeProps } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { Purchase } from '@automattic/api-core';

interface GSuiteCancellationSurveyOwnProps {
	disabled: boolean;
	onSurveyAnswerChange: ( surveyAnswerId: string | null, surveyAnswerText: string ) => void;
	purchase: Purchase;
	surveyAnswerId?: string | null;
	surveyAnswerText?: string;
}

const mapDispatchToProps = {
	recordTracksEvent,
};

type GSuiteCancellationSurveyProps = GSuiteCancellationSurveyOwnProps &
	typeof mapDispatchToProps &
	LocalizeProps;

class GSuiteCancellationSurvey extends Component< GSuiteCancellationSurveyProps > {
	static defaultProps = {};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_survey_view' );
	}

	render() {
		const {
			disabled,
			onSurveyAnswerChange,
			purchase: { product_slug: productSlug },
			surveyAnswerId,
			surveyAnswerText,
			translate,
		} = this.props;

		return (
			<MultipleChoiceQuestion
				name="gsuite-cancellation-survey-question"
				answers={ [
					{
						id: 'too-expensive',
						answerText: translate( "It's too expensive." ),
					},
					{
						id: 'do-not-need-it',
						answerText: translate( "I don't need it." ),
						textInput: true,
						textInputPrompt: translate( 'What are we missing that you need?' ),
					},
					{
						id: 'purchased-by-mistake',
						answerText: translate( 'I purchased it by mistake.' ),
					},
					{
						id: 'it-did-not-work',
						answerText: translate( 'I was unable to activate or use it.' ),
						textInput: true,
						textInputPrompt: translate( 'Where did you run into problems?' ),
					},
					{
						id: 'another-reason',
						answerText: translate( 'Another reason…' ),
						textInput: true,
						doNotShuffle: true,
					},
				] }
				question={ translate( 'Please tell us why you are cancelling %(googleMailService)s:', {
					args: {
						googleMailService: getGoogleMailServiceFamily( productSlug ),
					},
					comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
				} ) }
				onAnswerChange={ onSurveyAnswerChange }
				disabled={ disabled }
				selectedAnswerId={ surveyAnswerId }
				selectedAnswerText={ surveyAnswerText }
			/>
		);
	}
}

export default connect( null, mapDispatchToProps )( localize( GSuiteCancellationSurvey ) );
