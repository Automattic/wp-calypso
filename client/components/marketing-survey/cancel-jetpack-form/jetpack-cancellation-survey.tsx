import { Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useRef, useState, useCallback, ChangeEvent } from 'react';
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
	isAkismet?: boolean;
}

export default function JetpackCancellationSurvey( {
	selectedAnswerId,
	onAnswerChange,
	isAkismet = false,
}: JetpackCancellationSurveyProps ) {
	const translate = useTranslate();
	const [ customAnswerText, setCustomAnswerText ] = useState( '' );
	const customAnswerInputRef = useRef< HTMLInputElement | null >();

	const choices: Choice[] = [
		{
			id: 'too-expensive',
			answerText: translate( 'The plan was too expensive.' ),
		},
		{
			id: 'want-to-downgrade',
			answerText: translate( 'I’d like to downgrade to another plan.' ),
		},
		{
			id: 'upgrade-by-mistake',
			answerText: translate( 'This upgrade didn’t include what I needed.' ),
		},
		{
			id: 'could-not-activate',
			answerText: translate( 'I was unable to activate or use the product.' ),
		},
		{
			id: 'dont-need-website',
			answerText: translate( 'I no longer need a website.' ),
		},
		{
			id: 'could-not-get-support',
			answerText: translate( 'I couldn’t get the support I needed.' ),
		},
		{
			id: 'another-reason',
			answerText: translate( 'Other' ),
		},
	];

	const selectAnswer = useCallback(
		( answerId: string ) => {
			// Reset custom answer text anytime an answer changes
			const textFieldValue = selectedAnswerId === answerId ? customAnswerText : '';

			onAnswerChange( answerId, textFieldValue );
			setCustomAnswerText( textFieldValue );
		},
		[ onAnswerChange, setCustomAnswerText, customAnswerText, selectedAnswerId ]
	);

	const onChangeCustomAnswerText = useCallback(
		( event: ChangeEvent< HTMLInputElement > ) => {
			const { value } = event.target;

			onAnswerChange( selectedAnswerId, value );
			setCustomAnswerText( value );
		},
		[ selectedAnswerId, onAnswerChange, setCustomAnswerText ]
	);

	const renderChoiceCard = ( choice: Choice ) => {
		const isSelected = choice.id === selectedAnswerId;
		const textAnswerLabel =
			choice.id === 'another-reason'
				? translate( 'Share your experience (required)' )
				: translate( 'Please share any additional details.' );

		return (
			<Card
				className={ clsx( 'jetpack-cancellation-survey__card', {
					'is-selected': isSelected,
				} ) }
				id={ choice.id }
				key={ choice.id }
				onClick={ () => selectAnswer( choice.id ) }
				tagName="button"
			>
				<div className="jetpack-cancellation-survey__card-content">
					<p>{ choice.answerText }</p>
					{ isSelected && (
						<>
							<label
								className="jetpack-cancellation-survey__choice-item-text-input-label"
								htmlFor={ `${ choice.id }-text-answer` }
							>
								{ textAnswerLabel }
							</label>
							<FormTextInput
								className="jetpack-cancellation-survey__choice-item-text-input"
								id={ `${ choice.id }-text-answer` }
								inputRef={ customAnswerInputRef }
								onChange={ onChangeCustomAnswerText }
								value={ customAnswerText }
							/>
						</>
					) }
				</div>
			</Card>
		);
	};

	const headerText = isAkismet
		? translate( 'Before you go, help us improve Akismet' )
		: translate( 'Before you go, help us improve Jetpack' );

	return (
		<>
			<FormattedHeader
				headerText={ headerText }
				subHeaderText={ translate( 'Please let us know why you are cancelling.' ) }
				align="center"
				isSecondary
			/>
			{ choices.map( renderChoiceCard ) }
		</>
	);
}
