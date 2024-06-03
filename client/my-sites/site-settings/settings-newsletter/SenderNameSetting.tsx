import { FormLabel, FormInputValidation } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import { useSelector } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';

type SenderNameSettingProps = {
	value?: string;
	disabled?: boolean;
	replyToValue?: string;
	updateFields: ( fields: { [ key: string ]: unknown } ) => void;
};

function replyToExampleEmail( replyToEmail?: string ) {
	if ( replyToEmail === 'author' ) {
		return 'author-name@example.com';
	}
	if ( replyToEmail === 'comment' ) {
		return `comment-reply@wordpress.com'`;
	}

	return 'donotreply@wordpress.com';
}

export const SenderNameSetting = ( {
	value = '',
	disabled,
	replyToValue,
	updateFields,
}: SenderNameSettingProps ) => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const placeholder = selectedSite?.name || translate( 'Sender name' );
	const reply_to_email = replyToExampleEmail( replyToValue );

	return (
		<FormFieldset>
			<FormLabel>{ translate( 'Sender name' ) }</FormLabel>

			<FormTextInput
				name="jetpack_subscriptions_from_name"
				id="jetpack_subscriptions_from_name"
				value={ value }
				onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
					return updateFields( { jetpack_subscriptions_from_name: event.target.value } );
				} }
				disabled={ disabled }
				placeholder={ placeholder }
			/>
			<FormInputValidation
				hasIcon={ false }
				text={ translate( 'Example: %(value)s <%(email)s>', {
					args: {
						value: value || placeholder,
						email: reply_to_email,
					},
				} ) }
				isMuted
				isError={ false }
			/>

			<FormSettingExplanation>
				{ translate(
					"This is the name that appears in subscribers' inboxes. It's usually the name of your newsletter or the author."
				) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};
