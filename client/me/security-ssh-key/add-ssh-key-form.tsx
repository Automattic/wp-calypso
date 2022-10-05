import { Button } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import { ChangeEvent, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextarea from 'calypso/components/forms/form-textarea';

const PUBLIC_SSH_KEY_INPUT_ID = 'public_ssh_key';

const keyFormats = [
	'ssh-rsa',
	'ssh-ed25519',
	'ssh-dss',
	'ecdsa-sha2-nistp256',
	'ecdsa-sha2-nistp384',
	'ecdsa-sha2-nistp521',
];

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
					placeholder={ sprintf(
						// translators: "formats" is a list of SSH-key formats.
						__( 'Paste the public key here. It should begin with %(formats)s…' ),
						{
							formats: new Intl.ListFormat( i18n.getLocaleSlug() ?? 'en', {
								style: 'long',
								type: 'disjunction',
							} ).format( keyFormats ),
						}
					) }
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
