import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { TextAreaField } from 'calypso/signup/accordion-form/form-components';
import { updateFeedback } from 'calypso/state/signup/steps/website-content/actions';
import type { WebsiteContent } from 'calypso/state/signup/steps/website-content/schema';

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
		onChangeField && onChangeField( e );
	};
	return (
		<TextAreaField
			name="generic_feedback"
			onChange={ onContentChange }
			value={ data.genericFeedback }
			label={ translate(
				'Optional: Is there anything else you would like the site builder to know?'
			) }
		/>
	);
}
