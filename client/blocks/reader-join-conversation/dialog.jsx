import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog, WordPressLogo } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import SpinnerLine from 'calypso/components/spinner-line';
import useLoginWindow from 'calypso/data/reader/use-login-window';

import './style.scss';

const ReaderJoinConversationDialog = ( { onClose, isVisible, loggedInAction, onLoginSuccess } ) => {
	const translate = useTranslate();

	// useState to track if login popup is open
	const [ isLoginPopupOpen, setIsLoginPopupOpen ] = useState( false );

	const trackEvent = ( eventName ) => {
		let eventProps = {};
		if ( loggedInAction ) {
			eventProps = {
				type: loggedInAction?.type,
				blog_id: loggedInAction?.siteId,
				post_id: loggedInAction?.postId,
				tag: loggedInAction?.tag,
			};
		}
		recordTracksEvent( eventName, eventProps );
	};

	const handleLoginSuccess = () => {
		setIsLoginPopupOpen( false );
		trackEvent( 'calypso_reader_dialog_login_success' );
		onLoginSuccess();
	};

	// Use useEffect to only track the event once when the dialog is first shown
	useEffect( () => {
		if ( isVisible ) {
			trackEvent( 'calypso_reader_dialog_shown' );
		}
	}, [ isVisible ] );

	const { login, createAccount, close } = useLoginWindow( {
		onLoginSuccess: handleLoginSuccess,
		onWindowClose: () => setIsLoginPopupOpen( false ),
	} );

	const onLoginClick = () => {
		setIsLoginPopupOpen( true );
		trackEvent( 'calypso_reader_dialog_login_clicked' );
		login();
	};

	const onCreateAccountClick = () => {
		setIsLoginPopupOpen( true );
		trackEvent( 'calypso_reader_dialog_create_account_clicked' );
		createAccount();
	};

	const onCancelClick = () => {
		setIsLoginPopupOpen( false );
		trackEvent( 'calypso_reader_dialog_cancel_clicked' );
		close();
	};

	const onCloseClick = () => {
		setIsLoginPopupOpen( false );
		trackEvent( 'calypso_reader_dialog_close_clicked' );
		close();
		onClose();
	};

	return (
		<Dialog
			additionalClassNames="reader-join-conversation-dialog"
			isVisible={ isVisible }
			onClose={ onCloseClick }
			showCloseIcon
			label={ translate( 'Join the conversation' ) }
			shouldCloseOnEsc
		>
			<div className="reader-join-conversation-dialog__content">
				<WordPressLogo size={ 32 } />
				<h1>{ translate( 'Join the conversation' ) }</h1>
				<p>
					{ translate( 'Sign in to like, comment, reblog, and subscribe to your favorite blogs.' ) }
				</p>
				{ isLoginPopupOpen ? (
					<>
						<SpinnerLine />
						<Button
							isLink
							onClick={ onCancelClick }
							className="reader-join-conversation-dialog__cancel"
						>
							{ translate( 'Cancel' ) }
						</Button>
					</>
				) : (
					<>
						<Button
							isPrimary
							onClick={ onCreateAccountClick }
							className="reader-join-conversation-dialog__create-account-button"
						>
							{ translate( 'Create a new account' ) }
						</Button>
						<Button
							isLink
							onClick={ onLoginClick }
							className="reader-join-conversation-dialog__login"
						>
							{ translate( 'Log in' ) }
						</Button>
					</>
				) }
			</div>
		</Dialog>
	);
};

export default ReaderJoinConversationDialog;
