import { Button, FormInputValidation } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import { ChangeEvent, useReducer } from 'react';
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

const initialState = {
	touched: false,
	isValid: false,
	value: '',
};

const sshKeyValidation = new RegExp( `^(?:${ keyFormats.join( '|' ) })\\s.+` );

type ReducerAction = { type: 'setValue'; value: string };

const sshKeyFormReducer = ( state = initialState, action: ReducerAction ): typeof initialState => {
	switch ( action.type ) {
		case 'setValue':
			return {
				touched: true,
				isValid: sshKeyValidation.test( action.value ),
				value: action.value,
			};

		default:
			return state;
	}
};

interface AddSSHKeyFormProps {
	addSSHKey( args: { name: string; key: string } ): void;
	isAdding: boolean;
}

export const AddSSHKeyForm = ( { addSSHKey, isAdding }: AddSSHKeyFormProps ) => {
	const [ { isValid, touched, value }, dispatch ] = useReducer( sshKeyFormReducer, initialState );

	const { __ } = useI18n();
	const formats = new Intl.ListFormat( i18n.getLocaleSlug() ?? 'en', {
		style: 'long',
		type: 'disjunction',
	} ).format( keyFormats );

	const showSSHKeyError = touched && ! isValid;

	return (
		<form
			onSubmit={ ( event ) => {
				event.preventDefault();
				addSSHKey( { name: 'default', key: value } );
			} }
		>
			<FormFieldset>
				<FormLabel htmlFor={ PUBLIC_SSH_KEY_INPUT_ID }>{ __( 'Public SSH key' ) }</FormLabel>
				<FormTextarea
					required
					id={ PUBLIC_SSH_KEY_INPUT_ID }
					disabled={ isAdding }
					value={ value }
					isError={ showSSHKeyError }
					placeholder={ sprintf(
						// translators: "formats" is a list of SSH-key formats.
						__( 'Paste the public key here. It should begin with %(formats)s…' ),
						{
							formats,
						}
					) }
					onChange={ ( event: ChangeEvent< HTMLTextAreaElement > ) =>
						dispatch( { type: 'setValue', value: event.target.value } )
					}
				/>
				{ showSSHKeyError && (
					<FormInputValidation
						isError
						text={ sprintf(
							// translators: "formats" is a list of SSH-key formats.
							__( 'Invalid public key. It should begin with %(formats)s.' ),
							{
								formats,
							}
						) }
					/>
				) }
			</FormFieldset>
			<Button busy={ isAdding } primary type="submit" disabled={ ! isValid || isAdding }>
				{ __( 'Save SSH key' ) }
			</Button>
		</form>
	);
};
