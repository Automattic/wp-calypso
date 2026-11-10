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
			<div css={ { display: 'flex', alignItems: 'stretch' } }>
				<span
					css={ {
						display: 'flex',
						alignItems: 'center',
						padding: '0 12px',
						background: 'var(--color-neutral-0)',
						border: '1px solid var(--color-neutral-10)',
						borderRight: 0,
						borderRadius: '2px 0 0 2px',
						color: 'var(--color-text-subtle)',
						whiteSpace: 'nowrap',
					} }
				>
					{ __( '[site root]' ) }
				</span>
				<FormTextInput
				id="targetDir"
				placeholder="/"
				value={ value }
				css={ { borderRadius: '0 2px 2px 0', flex: 1 } }
				onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
					let targetDir = event.currentTarget.value.trim();
					targetDir = targetDir.startsWith( '/' ) ? targetDir : `/${ targetDir }`;

					onChange( targetDir );
				} }
			/>
			</div>
			<FormSettingExplanation css={ { marginBottom: '0 !important' } }>
				{ __( 'This path is relative to the site root' ) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};
