import { GravatarQuickEditorCore } from '@gravatar-com/quick-editor';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, upload, caution } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useState, useEffect, useRef, CSSProperties, KeyboardEvent } from 'react';
import { ButtonStack } from '../../components/button-stack';

interface EditGravatarProps {
	/** URL to the user's avatar image */
	avatarUrl: string;
	/** User's email address for gravatar upload */
	userEmail: string;
	/** Whether the user's email is verified */
	isEmailVerified?: boolean;
}

const EditGravatar = ( { isEmailVerified = true, avatarUrl, userEmail }: EditGravatarProps ) => {
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

	// Create styles with hover effect
	const overlayStyle: CSSProperties = {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		opacity: isOverlayVisible ? 1 : 0,
		transition: 'opacity 0.2s',
	};

	const openGravatarEditor = () => {
		handleUnverifiedUserClick();
		if ( isEmailVerified ) {
			quickEditorRef.current?.open?.();
		}
	};

	return (
		<VStack spacing={ 4 }>
			<ButtonStack justify="flex-start">
				<button
					type="button"
					onClick={ openGravatarEditor }
					style={ {
						border: 'none',
						padding: 0,
						background: 'transparent',
						cursor: isEmailVerified ? 'pointer' : 'default',
					} }
					aria-label={ uploadButtonLabel }
				>
					<div
						style={ {
							position: 'relative',
							width: 48,
							height: 48,
							borderRadius: '50%',
							overflow: 'hidden',
						} }
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
							style={ { objectFit: 'cover' } }
						/>

						<div className="overlay-hover" style={ overlayStyle }>
							<div style={ { color: '#fff' } }>
								{ ! isEmailVerified && (
									<Icon icon={ caution } size={ 24 } style={ { fill: '#fff' } } />
								) }

								{ isEmailVerified && (
									<Icon icon={ upload } size={ 24 } style={ { fill: '#fff' } } />
								) }
							</div>
						</div>
					</div>
				</button>
				<Button variant="tertiary" onClick={ openGravatarEditor }>
					{ __( 'Update avatar' ) }
				</Button>
			</ButtonStack>

			{ showEmailVerificationNotice && (
				<div
					style={ {
						backgroundColor: '#fff8e5',
						padding: 12,
						margin: '8px 0',
						borderLeft: '3px solid #f0b849',
					} }
				>
					<p style={ { marginBottom: 8 } }>
						{ __( 'Please verify your email address to change your profile photo.' ) }
					</p>
					<Button onClick={ closeVerifyEmailDialog } variant="secondary">
						{ __( 'Close' ) }
					</Button>
				</div>
			) }
		</VStack>
	);
};

export default EditGravatar;
