import { useTranslate } from 'i18n-calypso';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import './style.scss';
import { ChangeEventHandler } from 'react';

export type BlockEmailsSettingProps = {
	value: boolean;
	onChange: ChangeEventHandler<HTMLInputElement>;
}

const BlockEmailsSetting = ( { value, onChange }: BlockEmailsSettingProps ) => {
	const translate = useTranslate();

	return (
		<FormFieldset className="block-emails-setting">
			<span className="title">Block emails</span>
			<FormLabel>
				<FormInputCheckbox name="block_emails_setting" checked={ value } onChange={ onChange }/>
				<span>
					{ translate( 'Block all email updates from sites you’re following on WordPress.com' ) }
				</span>
			</FormLabel>
		</FormFieldset>
	);
};

export default BlockEmailsSetting;
