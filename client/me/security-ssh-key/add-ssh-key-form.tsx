import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextarea from 'calypso/components/forms/form-textarea';

const PUBLIC_SSH_KEY_INPUT_ID = 'public_ssh_key';

interface AddSSHKeyFormProps {
	addSSHKey( args: { name: string; key: string } ): void;
}

export const AddSSHKeyForm = ( { addSSHKey }: AddSSHKeyFormProps ) => {
	const [ publicSSHKey, setPublicSSHKey ] = useState( '' );

	const { __ } = useI18n();

	return (
		<form
			onSubmit={ ( event ) => {
				event.preventDefault();
				addSSHKey( { name: 'default', key: publicSSHKey } );
			} }
		>
			<FormFieldset>
				<FormLabel htmlFor={ PUBLIC_SSH_KEY_INPUT_ID }>{ __( 'Public SSH key' ) }</FormLabel>
				<FormTextarea
					required
					id={ PUBLIC_SSH_KEY_INPUT_ID }
					value={ publicSSHKey }
					onChange={ ( event: ChangeEvent< HTMLTextAreaElement > ) =>
						setPublicSSHKey( event.target.value )
					}
				/>
			</FormFieldset>
			<Button primary type="submit">
				{ __( 'Save SSH key' ) }
			</Button>
		</form>
	);
};
