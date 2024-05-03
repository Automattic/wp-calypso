import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';

type ReplyToSettingProps = {
	value?: string;
	disabled?: boolean;
	updateFields: ( fields: { [ key: string ]: unknown } ) => void;
};

export const ReplyToSetting = ( {
	value = 'no-reply',
	disabled,
	updateFields,
	isWPcomSite,
}: ReplyToSettingProps ) => {
	const translate = useTranslate();
	return (
		<FormFieldset>
			<FormLabel className="increase-margin-bottom-fix">
				{ translate( 'Reply-to settings' ) }
			</FormLabel>
			<p>
				{ translate( 'Choose who receives emails when subscribers reply to your newsletter.' ) }
			</p>
			<FormLabel>
				<FormRadio
					value="no-reply"
					checked={ value === 'no-reply' || value === '' }
					onChange={ () => updateFields( { jetpack_subscriptions_reply_to: 'no-reply' } ) }
					disabled={ disabled }
					label={ translate( 'Replies are not allowed' ) }
				/>
			</FormLabel>
			{ isWPcomSite && (
				<>
					<FormLabel>
						<FormRadio
							checked={ value === 'comment' }
							value="comment"
							onChange={ () => updateFields( { jetpack_subscriptions_reply_to: 'comment' } ) }
							disabled={ disabled }
							label={ translate( 'Replies will be a public comment on the post' ) }
						/>
					</FormLabel>
				</>
			) }
			<FormLabel>
				<FormRadio
					checked={ value === 'author' }
					value="author"
					onChange={ () => updateFields( { jetpack_subscriptions_reply_to: 'author' } ) }
					disabled={ disabled }
					label={ translate( "Replies will be sent to the post author's email" ) }
				/>
			</FormLabel>
		</FormFieldset>
	);
};
