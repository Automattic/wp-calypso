/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { ChangeEventHandler } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
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
				{ translate( 'Block emails' ) }
			</FormLabel>
			<FormLabel htmlFor="blocked">
				<FormInputCheckbox id="blocked" name="blocked" checked={ value } onChange={ onChange } />
				<span>
					{ translate( 'Block all email updates from sites you’re following on WordPress.com' ) }
				</span>
			</FormLabel>
		</FormFieldset>
	);
};

export default BlockEmailsSetting;
