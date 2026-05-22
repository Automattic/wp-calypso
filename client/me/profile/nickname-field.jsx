import { FormInputValidation, FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import wp from 'calypso/lib/wp';

const NICKNAME_REGEX = /^[a-zA-Z0-9 _-]*$/;
const MAX_LENGTH = 50;

export default function NicknameField( { initialNickname = '' } ) {
	const translate = useTranslate();
	const [ nicknameValue, setNicknameValue ] = useState( initialNickname );
	const [ nicknameSavedValue, setNicknameSavedValue ] = useState( initialNickname );
	const [ nicknameSaveStatus, setNicknameSaveStatus ] = useState( 'idle' );
	const [ hasValidationError, setHasValidationError ] = useState( false );

	useEffect( () => {
		setNicknameValue( initialNickname );
		setNicknameSavedValue( initialNickname );
	}, [ initialNickname ] );

	const handleNicknameBlur = async () => {
		const trimmed = nicknameValue.trim();
		if ( ! NICKNAME_REGEX.test( trimmed ) || trimmed.length > MAX_LENGTH ) {
			setHasValidationError( true );
			return;
		}
		setHasValidationError( false );
		if ( trimmed === nicknameSavedValue ) {
			return;
		}
		setNicknameSaveStatus( 'saving' );
		try {
			const response = await wp.req.post( '/user/save-meta', {
				meta_key: 'nickname',
				meta_value: trimmed,
			} );
			if ( response.success ) {
				setNicknameSavedValue( trimmed );
				setNicknameSaveStatus( 'saved' );
				setTimeout( () => setNicknameSaveStatus( 'idle' ), 3000 );
			} else {
				setNicknameSaveStatus( 'error' );
			}
		} catch {
			setNicknameSaveStatus( 'error' );
		}
	};

	return (
		<FormFieldset>
			<FormLabel htmlFor="nickname">{ translate( 'Nickname' ) }</FormLabel>
			<FormTextInput
				id="nickname"
				name="nickname"
				value={ nicknameValue }
				onChange={ ( e ) => setNicknameValue( e.target.value ) }
				onBlur={ handleNicknameBlur }
				placeholder={ translate( 'Enter your nickname' ) }
				maxLength={ MAX_LENGTH }
				isError={ nicknameSaveStatus === 'error' || hasValidationError }
			/>
			{ nicknameSaveStatus === 'saved' && ! hasValidationError && (
				<FormInputValidation isError={ false } text={ translate( 'Saved' ) } />
			) }
			{ nicknameSaveStatus === 'error' && ! hasValidationError && (
				<FormInputValidation
					isError
					text={ translate( 'Failed to save nickname. Please try again.' ) }
				/>
			) }
			{ hasValidationError && (
				<FormInputValidation
					isError
					text={ translate(
						'Nickname contains invalid characters or exceeds 50 characters.'
					) }
				/>
			) }
		</FormFieldset>
	);
}
