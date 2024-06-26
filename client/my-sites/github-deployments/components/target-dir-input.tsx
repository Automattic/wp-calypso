import { FormLabel } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';

interface TargetDirInputProps {
	onChange( value: string ): void;
	value: string;
}

export const TargetDirInput = ( { onChange, value }: TargetDirInputProps ) => {
	const { __ } = useI18n();

	return (
		<FormFieldset>
			<FormLabel htmlFor="targetDir">{ __( 'Destination directory' ) }</FormLabel>
			<FormTextInput
				id="targetDir"
				placeholder="/"
				value={ value }
				onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
					let targetDir = event.currentTarget.value.trim();
					targetDir = targetDir.startsWith( '/' ) ? targetDir : `/${ targetDir }`;

					onChange( targetDir );
				} }
			/>
			<FormSettingExplanation css={ { marginBottom: '0 !important' } }>
				{ __( 'This path is relative to the server root' ) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};
