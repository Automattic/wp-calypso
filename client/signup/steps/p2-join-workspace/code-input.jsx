import { Spinner } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';

function P2JoinWorkspaceCodeInput( { workspaceStatus, setWorkspaceStatus } ) {
	const CHALLENGE_CODE_LENGTH = 6;
	const CHALLENGE_CODE_ALLOWED_CHARS = /^[a-zA-Z0-9]$/;
	const CHALLENGE_CODE_SELECTOR = 'input.p2-join-workspace__code-input-box';

	// Input from the user.
	const [ challengeCode, setChallengeCode ] = useState( '' );
	const [ error, setError ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( false );

	const handleCodeInputChange = ( event ) => {
		const inputBoxes = event.target.parentNode.querySelectorAll( CHALLENGE_CODE_SELECTOR );
		const newCode = Array.from( inputBoxes ).reduce( ( acc, curr ) => acc + curr.value, '' );
		setChallengeCode( newCode );
	};

	const handleCodeInputKeyPress = ( event ) => {
		// Reject invalid characters.
		if ( event.key.match( CHALLENGE_CODE_ALLOWED_CHARS ) === null ) {
			event.preventDefault();
			return false;
		}

		return true;
	};

	const handleCodeInputKeyUp = ( event ) => {
		const inputBoxes = event.target.parentNode.querySelectorAll( CHALLENGE_CODE_SELECTOR );
		const currentIndex = Array.from( inputBoxes ).indexOf( event.target );
		if ( event.key === 'Backspace' && currentIndex > 0 ) {
			inputBoxes[ currentIndex - 1 ].focus();
		} else if (
			event.key.match( CHALLENGE_CODE_ALLOWED_CHARS ) &&
			currentIndex < inputBoxes.length - 1
		) {
			inputBoxes[ currentIndex + 1 ].focus();
		}

		return true;
	};

	const handleCodeInputPaste = ( event ) => {
		event.preventDefault();
		const text = ( event.clipboardData || window.clipboardData ).getData( 'text' );

		if ( ! text ) {
			return false;
		}

		const chars = text.split( '' ).filter( ( char ) => char.match( CHALLENGE_CODE_ALLOWED_CHARS ) );
		const inputBoxes = event.target.parentNode.querySelectorAll( CHALLENGE_CODE_SELECTOR );
		inputBoxes.forEach( ( box, index ) => {
			if ( index > chars.length - 1 ) {
				return;
			}

			box.value = chars[ index ] || '';
		} );

		// Update challenge code in state.
		const newCode = Array.from( inputBoxes ).reduce( ( acc, curr ) => acc + curr.value, '' );
		setChallengeCode( newCode );

		// Focus on first empty input box, or last if all filled.
		const focusIndex = Math.min( chars.length, inputBoxes.length - 1 );
		inputBoxes[ focusIndex ].focus();

		return false;
	};

	const handleSubmitCode = async () => {
		const hubId = workspaceStatus.requested?.id;
		if ( ! hubId ) {
			return;
		}

		setIsLoading( true );

		recordTracksEvent( 'calypso_signup_p2_join_workspace_code_attempt' );

		await wpcom.req.post(
			{
				path: '/p2/preapproved-joining/request-join',
				apiNamespace: 'wpcom/v2',
				global: true,
				body: {
					hub_id: hubId,
					code: challengeCode,
				},
			},
			( err, response ) => {
				setIsLoading( false );

				if ( ! response.success ) {
					recordTracksEvent( 'calypso_signup_p2_join_workspace_code_attempt_fail' );
					setError( response.error || __( 'An error has occurred. Please try again.' ) );
					return;
				}

				recordTracksEvent( 'calypso_signup_p2_join_workspace_code_attempt_success' );

				setWorkspaceStatus( {
					...workspaceStatus,
					requested: null,
					joined: [ ...workspaceStatus.joined, parseInt( response.hub_id ) ],
				} );

				setError( null );
			}
		);
	};

	const handleCancelJoin = () => {
		recordTracksEvent( 'calypso_signup_p2_join_workspace_join_request_cancel' );
		setWorkspaceStatus( { ...workspaceStatus, requested: null } );
		setError( null );
	};

	const renderCodeInputFieldset = () => {
		const fieldset = [];
		for ( let index = 0; index < CHALLENGE_CODE_LENGTH; index++ ) {
			fieldset.push(
				<input
					key={ index }
					className="p2-join-workspace__code-input-box"
					maxLength={ 1 }
					onChange={ ( event ) => {
						handleCodeInputChange( event, index );
					} }
					onKeyPress={ handleCodeInputKeyPress }
					onKeyUp={ handleCodeInputKeyUp }
					onPaste={ handleCodeInputPaste }
					autoFocus={ index === 0 } // eslint-disable-line jsx-a11y/no-autofocus
				/>
			);

			if ( index === CHALLENGE_CODE_LENGTH / 2 - 1 ) {
				fieldset.push(
					<span key="separator" className="p2-join-workspace__code-input-separator"></span>
				);
			}
		}

		if ( error ) {
			fieldset.push(
				<div key="error" className="p2-join-workspace__code-input-error">
					{ error }
				</div>
			);
		}

		return fieldset;
	};

	const formClasses = clsx( 'p2-join-workspace__code-input-form', {
		'has-error': error,
	} );

	return (
		<div className="p2-join-workspace__code-input">
			<div className="p2-join-workspace__code-input-label">
				{ __( 'Enter the code to continue, please.' ) }
			</div>
			<form className={ formClasses }>
				<fieldset>{ renderCodeInputFieldset() }</fieldset>
				<Button
					className="p2-join-workspace__code-input-submit"
					onClick={ handleSubmitCode }
					isPrimary
					disabled={ challengeCode.length !== CHALLENGE_CODE_LENGTH }
					isBusy={ isLoading }
				>
					{ isLoading ? <Spinner /> : __( 'Continue' ) }
				</Button>
				<Button className="p2-join-workspace__code-input-cancel" onClick={ handleCancelJoin }>
					{ __( 'Cancel' ) }
				</Button>
			</form>
		</div>
	);
}

export default P2JoinWorkspaceCodeInput;
