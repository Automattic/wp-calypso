import { Dialog } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import LoginBlock from 'calypso/blocks/login';

import './style.scss';

const ReaderJoinConversationDialog = ( { onClose, isVisible } ) => {
	const translate = useTranslate();
	// use state to track if button is clicked
	// if button is clicked, show login form
	// if login form is submitted, close dialog
	// if login form is closed, close dialog
	// if dialog is closed, reset state
	const [ isLoginVisible, setIsLoginVisible ] = useState( false );
	const showLogin = () => {
		setIsLoginVisible( true );
	};
	const hideLogin = () => {
		setIsLoginVisible( false );
	};
	return (
		<Dialog
			additionalClassNames="reader-join-conversation-dialog"
			isBackdropVisible={ true }
			isVisible={ isVisible }
			onClose={ onClose }
			showCloseIcon={ true }
			label={ translate( 'Join the conversation' ) }
			shouldCloseOnEsc={ true }
		>
			{ ! isLoginVisible && (
				<div className="reader-join-conversation-dialog__content">
					<h1>{ translate( 'Join the conversation' ) }</h1>
					<p>
						{ translate( 'Sign in to like, comment, reblog, and follow your favorite blogs.' ) }
					</p>
					<Button
						isPrimary
						onClick={ showLogin }
						className="reader-join-conversation-dialog__create-account-button"
					>
						{ translate( 'Create a new account' ) }
					</Button>
				</div>
			) }
			{ isLoginVisible && (
				<LoginBlock
					className="reader-join-conversation-dialog__login-block"
					onClose={ hideLogin }
					onSuccess={ hideLogin }
				/>
			) }
		</Dialog>
	);
};

export default ReaderJoinConversationDialog;
