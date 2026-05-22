import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useCallback, useEffect } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import wpcom from 'calypso/lib/wp';

/**
 * Strips HTML tags from a string using a regex.
 * @param {string} str
 * @returns {string}
 */
function stripHtml( str ) {
	return str.replace( /<[^>]*>/g, '' );
}

/**
 * Nickname input field with auto-save on blur via POST /rest/v1.1/user/save-meta.
 * @param {Object} props
 * @param {string} [props.initialNickname] - Pre-populated value from user settings.
 */
function NicknameField( { initialNickname = '' } ) {
	const translate = useTranslate();
	const [ nickname, setNickname ] = useState( initialNickname );
	const [ savingState, setSavingState ] = useState( 'idle' );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const lastSavedNickname = useRef( initialNickname );
	const saveTimeout = useRef( null );
	const userEdited = useRef( false );

	// Sync initial value when user settings load asynchronously, as long as the
	// user hasn't started typing.
	useEffect( () => {
		if ( ! userEdited.current ) {
			setNickname( initialNickname );
			lastSavedNickname.current = initialNickname;
		}
	}, [ initialNickname ] );

	// Clean up pending timeout on unmount.
	useEffect( () => {
		return () => {
			if ( saveTimeout.current ) {
				clearTimeout( saveTimeout.current );
			}
		};
	}, [] );

	const handleChange = useCallback( ( event ) => {
		userEdited.current = true;
		setNickname( event.target.value );
	}, [] );

	const handleBlur = useCallback( async () => {
		const trimmed = nickname.trim();

		// No-op if value hasn't changed or is empty.
		if ( trimmed === lastSavedNickname.current || trimmed === '' ) {
			return;
		}

		const sanitized = stripHtml( trimmed );

		setSavingState( 'saving' );
		setErrorMessage( '' );

		try {
			await wpcom.req.post(
				'/user/save-meta',
				{ apiVersion: '1.1' },
				{ meta_key: 'nickname', meta_value: sanitized }
			);

			lastSavedNickname.current = sanitized;
			setSavingState( 'saved' );

			saveTimeout.current = setTimeout( () => setSavingState( 'idle' ), 2000 );
		} catch {
			setSavingState( 'error' );
			setErrorMessage( translate( 'Failed to save nickname. Please try again.' ) );
		}
	}, [ nickname, translate ] );

	return (
		<FormFieldset>
			<FormLabel htmlFor="nickname">{ translate( 'Nickname' ) }</FormLabel>
			<FormTextInput
				id="nickname"
				name="nickname"
				value={ nickname }
				onChange={ handleChange }
				onBlur={ handleBlur }
				maxLength={ 50 }
				placeholder={ translate( 'Enter your nickname' ) }
				disabled={ savingState === 'saving' }
			/>
			{ savingState === 'saving' && (
				<p className="profile__nickname-status">{ translate( 'Saving\u2026' ) }</p>
			) }
			{ savingState === 'saved' && (
				<p className="profile__nickname-status profile__nickname-status--saved">
					{ translate( 'Saved' ) }
				</p>
			) }
			{ savingState === 'error' && (
				<p className="profile__nickname-status profile__nickname-status--error">
					{ errorMessage }
				</p>
			) }
		</FormFieldset>
	);
}

export default NicknameField;
