import { Card } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useState, useCallback, ReactElement } from 'react';
import * as React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormTextInput from 'calypso/components/forms/form-text-input';

interface Choice {
	id: string;
	answerText: TranslateResult;
	hasTextInput?: boolean;
}

interface JetpackCancellationSurveyProps {
	selectedAnswerId: string | null;
	onAnswerChange: ( answerId: string | null, answerText: TranslateResult | string ) => void;
}

export default function JetpackCancellationSurvey( {
	selectedAnswerId,
	onAnswerChange,
}: JetpackCancellationSurveyProps ): ReactElement {
	const translate = useTranslate();
	const [ customAnswerText, setCustomAnswerText ] = useState< string >( '' );
	const customAnswerInputRef = React.useRef< HTMLInputElement | null >();

	const choices: Choice[] = [
		{
			id: 'too-expensive',
			answerText: translate( 'The plan was too expensive.' ),
		},
		{
			id: 'want-to-downgrade',
			answerText: translate( "I'd like to downgrade to another plan." ),
		},
		{
			id: 'upgrade-by-mistake',
			answerText: translate( "This upgrade didn't include what I needed." ),
		},
		{
			id: 'could-not-activate',
			answerText: translate( 'I was unable to activate or use the product.' ),
		},
	];

	const choiceOther: Choice = {
		id: 'another-reason',
		answerText: translate( 'Other:' ),
	};

	const selectAnswer = useCallback(
		( answerId: string ) => {
			// prevent from sending the answer text if it's not a custom answer
			const surveyAnswerText =
				choiceOther.id === answerId && customAnswerText ? customAnswerText : '';

			onAnswerChange( answerId, surveyAnswerText );
		},
		[ choiceOther.id, customAnswerText, onAnswerChange ]
	);

	const onChangeCustomAnswerText = useCallback(
		( event: React.ChangeEvent< HTMLInputElement > ) => {
			const { value } = event.target;

			onAnswerChange( selectedAnswerId, value );
			setCustomAnswerText( value );
		},
		[ selectedAnswerId, onAnswerChange, setCustomAnswerText ]
	);

	const renderChoiceCard = ( choice: Choice ): ReactElement => {
		return (
			<Card
				className={ classnames( 'jetpack-cancellation-survey__card', {
					'is-selected': choice.id === selectedAnswerId,
				} ) }
				tagName="button"
				onClick={ () => selectAnswer( choice.id ) }
				key={ choice.id }
			>
				<div className="jetpack-cancellation-survey__card-content">
					<span>{ choice.answerText }</span>
				</div>
			</Card>
		);
	};

	return (
		<React.Fragment>
			<FormattedHeader
				headerText={ translate( 'Before you go, help us improve Jetpack' ) }
				subHeaderText={ translate( 'Please let us know why you are cancelling.' ) }
				align="center"
				isSecondary={ true }
			/>
			{ choices.map( renderChoiceCard ) }

			{ /* The card for the 'other' option */ }
			<Card
				key={ choiceOther.id }
				className={ classnames( 'jetpack-cancellation-survey__card', {
					'is-selected': choiceOther.id === selectedAnswerId,
				} ) }
				tagName="button"
				onClick={ () => {
					selectAnswer( choiceOther.id );
					customAnswerInputRef?.current?.focus();
				} }
			>
				<div className="jetpack-cancellation-survey__card-content">
					<span>{ choiceOther.answerText }</span>
					<FormTextInput
						inputRef={ customAnswerInputRef }
						className="jetpack-cancellation-survey__choice-item-text-input"
						value={ customAnswerText }
						onChange={ onChangeCustomAnswerText }
						placeholder={ translate( 'share your experience' ) }
					/>
				</div>
			</Card>
		</React.Fragment>
	);
}
