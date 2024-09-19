import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

type ReplyToSettingProps = {
	value?: string;
	disabled?: boolean;
	updateFields: ( fields: { [ key: string ]: unknown } ) => void;
};

export const ReplyToSetting = ( {
	value = 'no-reply',
	disabled,
	updateFields,
}: ReplyToSettingProps ) => {
	const translate = useTranslate();

	return (
		<FormFieldset>
			<FormLabel className="increase-margin-bottom-fix">
				{ translate( 'Reply-to settings' ) }
			</FormLabel>
			<FormLabel>
				<FormRadio
					value="no-reply"
					checked={ value === 'no-reply' || value === '' }
					onChange={ () => updateFields( { jetpack_subscriptions_reply_to: 'no-reply' } ) }
					disabled={ disabled }
					label={ translate( 'Replies are not allowed' ) }
				/>
			</FormLabel>
			<FormLabel>
				<FormRadio
					checked={ value === 'comment' }
					value="comment"
					onChange={ () => updateFields( { jetpack_subscriptions_reply_to: 'comment' } ) }
					disabled={ disabled }
					label={ translate( 'Replies will be a public comment on the post' ) }
				/>
			</FormLabel>
			<FormLabel>
				<FormRadio
					checked={ value === 'author' }
					value="author"
					onChange={ () => updateFields( { jetpack_subscriptions_reply_to: 'author' } ) }
					disabled={ disabled }
					label={ translate( "Replies will be sent to the post author's email" ) }
				/>
			</FormLabel>
			<FormSettingExplanation>
				{ translate( 'Choose who receives emails when subscribers reply to your newsletter.' ) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};
