import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
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
	const { hasTranslation } = useI18n();
	const isEnglishLocale = useIsEnglishLocale();

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
					{
						// todo: remove translation check once translations are in place
						isEnglishLocale ||
						hasTranslation(
							'Pause all email updates from sites you’re subscribing on WordPress.com'
						)
							? translate(
									'Pause all email updates from sites you’re subscribing on WordPress.com'
							  )
							: translate( 'Pause all email updates from sites you’re following on WordPress.com' )
					}
				</span>
			</FormLabel>
		</FormFieldset>
	);
};

export default BlockEmailsSetting;
