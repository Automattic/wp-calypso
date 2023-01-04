import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';

type WelcomeEmailTextSettingProps = {
	value?: {
		invitation: string;
		comment_follow: string;
	};
	disabled?: boolean;
	updateFields: ( fields: { [ key: string ]: unknown } ) => void;
};

type SubscriptionOption = {
	[ key: string ]: string;
};

export const WelcomeEmailTextSetting = ( {
	value,
	disabled,
	updateFields,
}: WelcomeEmailTextSettingProps ) => {
	const translate = useTranslate();

	const onChangeFieldSubscriptionOptions =
		( field: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			const textFieldValue = event.target.value;

			const newValue: SubscriptionOption = {};
			newValue[ field ] = textFieldValue;

			const valueToSave = { ...value, ...newValue };

			updateFields( {
				[ 'subscription_options' ]: valueToSave,
			} );
		};

	return (
		<>
			<FormFieldset>
				<FormLabel>Welcome email text</FormLabel>
				<FormTextarea
					name=""
					id=""
					value={ value?.invitation }
					onChange={ onChangeFieldSubscriptionOptions( 'invitation' ) }
					disabled={ disabled }
					autoCapitalize="none"
					onClick={ null }
					onKeyPress={ null }
				/>
				<FormSettingExplanation>
					{ translate(
						'The welcome message sent out to new readers when they subscribe to your blog.'
					) }
				</FormSettingExplanation>
			</FormFieldset>
			<FormFieldset>
				<FormLabel>Comment follow email text</FormLabel>
				<FormTextarea
					name=""
					id=""
					value={ value?.comment_follow }
					onChange={ onChangeFieldSubscriptionOptions( 'comment_follow' ) }
					disabled={ disabled }
					autoCapitalize="none"
					onClick={ null }
					onKeyPress={ null }
				/>
				<FormSettingExplanation>
					{ translate( 'The email sent out when someone follows one of your posts.' ) }
				</FormSettingExplanation>
			</FormFieldset>
		</>
	);
};
