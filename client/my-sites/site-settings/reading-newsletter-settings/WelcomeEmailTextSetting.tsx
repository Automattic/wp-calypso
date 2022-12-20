import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';

type WelcomeEmailTextSettingProps = {
	value?: boolean;
	disabled?: boolean;
	updateFields?: ( fields: { [ key: string ]: unknown } ) => void;
};

export const WelcomeEmailTextSetting = ( {
	value = false,
	disabled,
	updateFields,
}: WelcomeEmailTextSettingProps ) => {
	const translate = useTranslate();
	return (
		<FormFieldset>
			<FormLabel>Welcome email text</FormLabel>
			{ value } { disabled }
			<FormTextarea
				name=""
				id=""
				value={ value }
				onChange={ updateFields }
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
	);
};
