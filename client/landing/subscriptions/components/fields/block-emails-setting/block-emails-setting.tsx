import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEventHandler } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import './style.scss';

export type BlockEmailsSettingProps = {
	value?: boolean;
	onChange: ChangeEventHandler< HTMLInputElement >;
};

const BlockEmailsSetting = ( { value, onChange }: BlockEmailsSettingProps ) => {
	const translate = useTranslate();
	return (
		<FormFieldset className="block-emails-setting">
			<FormLabel htmlFor="blocked" className="title">
				{ translate( 'Pause emails' ) }
			</FormLabel>
			<FormLabel htmlFor="blocked">
				<div className="input-container">
					<FormInputCheckbox id="blocked" name="blocked" checked={ value } onChange={ onChange } />
				</div>
				<span>
					{ translate( 'Pause all email updates from sites you’re subscribing on WordPress.com' ) }
				</span>
			</FormLabel>
		</FormFieldset>
	);
};

export default BlockEmailsSetting;
