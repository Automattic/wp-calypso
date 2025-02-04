import { Button, FormInputValidation, FormLabel } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import { ChangeEvent, useReducer } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import TextareaAutosize from 'calypso/components/textarea-autosize';
import { SSH_KEY_FORMATS } from './use-ssh-key-query';

const PUBLIC_SSH_KEY_INPUT_ID = 'public_ssh_key';

const initialState = {
	touched: false,
	isValid: false,
	value: '',
};

const sshKeyValidation = new RegExp( `^(?:${ SSH_KEY_FORMATS.join( '|' ) })\\s.+` );

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
	saveText?: string;
}

export const AddSSHKeyForm = ( { addSSHKey, isAdding, saveText }: AddSSHKeyFormProps ) => {
	const [ { isValid, touched, value }, dispatch ] = useReducer( sshKeyFormReducer, initialState );

	const { __ } = useI18n();
	const formats = new Intl.ListFormat( i18n.getLocaleSlug() ?? 'en', {
		style: 'long',
		type: 'disjunction',
	} ).format( SSH_KEY_FORMATS );

	const showSSHKeyError = touched && ! isValid;

	return (
		<form
			onSubmit={ ( event ) => {
				event.preventDefault();
				addSSHKey( { name: 'default', key: value } );
			} }
		>
			<FormFieldset>
				<FormLabel htmlFor={ PUBLIC_SSH_KEY_INPUT_ID }>{ __( 'SSH Public Key' ) }</FormLabel>
				<TextareaAutosize
					required
					id={ PUBLIC_SSH_KEY_INPUT_ID }
					disabled={ isAdding }
					value={ value }
					isError={ showSSHKeyError }
					placeholder={ sprintf(
						// translators: "formats" is a list of SSH-key formats.
						__( 'Paste your SSH public key here. It should begin with %(formats)s…' ),
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
							__( 'Invalid SSH public key. It should begin with %(formats)s.' ),
							{
								formats,
							}
						) }
					/>
				) }
			</FormFieldset>
			<Button busy={ isAdding } primary type="submit" disabled={ ! isValid || isAdding }>
				{ saveText || __( 'Save SSH Key' ) }
			</Button>
		</form>
	);
};
