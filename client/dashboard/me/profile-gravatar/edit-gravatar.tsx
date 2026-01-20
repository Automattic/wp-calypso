import { GravatarQuickEditorCore } from '@gravatar-com/quick-editor';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, upload, caution } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useState, useEffect, useRef, KeyboardEvent, forwardRef, useImperativeHandle } from 'react';
import { ButtonStack } from '../../components/button-stack';

interface EditGravatarProps {
	/** URL to the user's avatar image */
	avatarUrl: string;
	/** User's email address for gravatar upload */
	userEmail: string;
	/** Whether the user's email is verified */
	isEmailVerified?: boolean;
	/** Whether to show the avatar preview (default: true) */
	showAvatarPreview?: boolean;
}

export interface EditGravatarHandle {
	/** Opens the Gravatar Quick Editor popup */
	open: () => void;
}

const EditGravatar = forwardRef< EditGravatarHandle, EditGravatarProps >(
	( { isEmailVerified = true, avatarUrl, userEmail, showAvatarPreview = true }, ref ) => {
		const [ tempImage, setTempImage ] = useState< string | null >( null );
		const [ showEmailVerificationNotice, setShowEmailVerificationNotice ] =
			useState< boolean >( false );
		const [ isOverlayVisible, setIsOverlayVisible ] = useState< boolean >( false );

		const uploadButtonLabel = isEmailVerified
			? __( 'Change profile photo' )
			: __( 'Verify your email to change profile photo' );

		// Initialize the Gravatar Quick Editor to manage avatars in a dedicated Gravatar UI
		const quickEditorRef = useRef< GravatarQuickEditorCore | null >( null );
		const avatarUrlRef = useRef( avatarUrl );

		// Update the avatar URL reference when the prop changes
		useEffect( () => {
			avatarUrlRef.current = avatarUrl;
		}, [ avatarUrl ] );

		// Add a timestamp to the avatar URL to avoid cache since this component needs to show the latest avatar the user has uploaded
		const displayUrl = addQueryArgs( avatarUrlRef.current, { ver: Date.now() } );

		useEffect( () => {
			quickEditorRef.current = new GravatarQuickEditorCore( {
				email: userEmail,
				scope: [ 'avatars' ],
				utm: 'wpcomme',
				onProfileUpdated: () => {
					// Bust cache so the <img> reloads the latest avatar immediately
					setTempImage( addQueryArgs( avatarUrlRef.current, { ver: Date.now() } ) as string );
				},
			} );

			const onPageHide = () => {
				try {
					quickEditorRef.current?.close?.();
				} catch ( _e ) {}
			};
			window.addEventListener( 'pagehide', onPageHide );

			return () => {
				window.removeEventListener( 'pagehide', onPageHide );
				try {
					quickEditorRef.current?.close?.();
				} catch ( _e ) {}
				quickEditorRef.current = null;
			};
		}, [ userEmail ] );

		const handleUnverifiedUserClick = (): void => {
			if ( ! isEmailVerified ) {
				setShowEmailVerificationNotice( true );
			}
		};

		const closeVerifyEmailDialog = (): void => {
			setShowEmailVerificationNotice( false );
		};

		const handleMouseOver = (): void => {
			setIsOverlayVisible( true );
		};

		const handleMouseOut = (): void => {
			setIsOverlayVisible( false );
		};

		const handleFocus = (): void => {
			setIsOverlayVisible( true );
		};

		const handleBlur = (): void => {
			setIsOverlayVisible( false );
		};

		const handleKeyDown = ( event: KeyboardEvent< HTMLDivElement > ): void => {
			if ( event.key === 'Enter' || event.key === ' ' ) {
				event.preventDefault();
				if ( isEmailVerified ) {
					// The openFileDialog function will be called by the button's onClick handler
				}
			}
		};

		const openGravatarEditor = () => {
			handleUnverifiedUserClick();
			if ( isEmailVerified ) {
				quickEditorRef.current?.open?.();
			}
		};

		// Expose the open function to parent components via ref
		useImperativeHandle(
			ref,
			() => ( {
				open: openGravatarEditor,
			} ),
			[ isEmailVerified ]
		);

		// Button-only mode (no avatar preview)
		if ( ! showAvatarPreview ) {
			return (
				<>
					<Button variant="secondary" onClick={ openGravatarEditor }>
						{ __( 'Update avatar' ) }
					</Button>
					{ showEmailVerificationNotice && (
						<div className="edit-gravatar__verification-notice">
							<p>{ __( 'Please verify your email address to change your profile photo.' ) }</p>
							<Button onClick={ closeVerifyEmailDialog } variant="secondary">
								{ __( 'Close' ) }
							</Button>
						</div>
					) }
				</>
			);
		}

		return (
			<VStack spacing={ 4 }>
				<ButtonStack justify="flex-start">
					<button
						type="button"
						onClick={ openGravatarEditor }
						className={ clsx( 'edit-gravatar__button', {
							'edit-gravatar__button--disabled': ! isEmailVerified,
						} ) }
						aria-label={ uploadButtonLabel }
					>
						<div
							className="edit-gravatar__avatar-container"
							onMouseOver={ handleMouseOver }
							onMouseOut={ handleMouseOut }
							onFocus={ handleFocus }
							onBlur={ handleBlur }
							onKeyDown={ handleKeyDown }
							tabIndex={ 0 }
							role="button"
							aria-label={ uploadButtonLabel }
						>
							<img
								src={ tempImage || displayUrl }
								alt={ __( 'Gravatar' ) }
								width={ 48 }
								height={ 48 }
								className="edit-gravatar__avatar-image"
							/>

							<div
								className={ clsx( 'edit-gravatar__overlay', {
									'edit-gravatar__overlay--visible': isOverlayVisible,
								} ) }
							>
								<div className="edit-gravatar__overlay-icon">
									{ ! isEmailVerified && <Icon icon={ caution } size={ 24 } /> }

									{ isEmailVerified && <Icon icon={ upload } size={ 24 } /> }
								</div>
							</div>
						</div>
					</button>
					<Button variant="tertiary" onClick={ openGravatarEditor }>
						{ __( 'Update' ) }
					</Button>
				</ButtonStack>

				{ showEmailVerificationNotice && (
					<div className="edit-gravatar__verification-notice">
						<p>{ __( 'Please verify your email address to change your profile photo.' ) }</p>
						<Button onClick={ closeVerifyEmailDialog } variant="secondary">
							{ __( 'Close' ) }
						</Button>
					</div>
				) }
			</VStack>
		);
	}
);

EditGravatar.displayName = 'EditGravatar';

export default EditGravatar;
