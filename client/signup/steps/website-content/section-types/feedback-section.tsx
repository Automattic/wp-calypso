import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import { TextAreaField, LabelBlock } from 'calypso/signup/accordion-form/form-components';
import { useDispatch } from 'calypso/state';
import { updateFeedback } from 'calypso/state/signup/steps/website-content/actions';
import { FEEDBACK_SECTION_CHARACTER_LIMIT } from './constants';
import type { WebsiteContent } from 'calypso/state/signup/steps/website-content/types';
export function FeedbackSection( {
	data,
	onChangeField,
}: {
	data: WebsiteContent[ 'feedbackSection' ];
	onChangeField?: ( { target: { name, value } }: ChangeEvent< HTMLInputElement > ) => void;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onContentChange = ( e: ChangeEvent< HTMLInputElement > ) => {
		const {
			target: { value },
		} = e;
		dispatch( updateFeedback( value ) );
		onChangeField?.( e );
	};
	return (
		<>
			<TextAreaField
				rows={ 3 }
				name="generic_feedback"
				onChange={ onContentChange }
				value={ data.genericFeedback || '' }
				label={ translate(
					'Optional: Is there anything else you would like the site builder to know?'
				) }
				characterLimit={ FEEDBACK_SECTION_CHARACTER_LIMIT }
				characterLimitError={ translate( 'Character limit reached.' ) }
				shouldEnforceCharacterLimit
			/>
			<LabelBlock>
				{ translate( 'Click Submit when you are finished providing content for all pages.' ) }
			</LabelBlock>
		</>
	);
}
