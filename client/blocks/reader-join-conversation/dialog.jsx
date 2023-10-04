import { Dialog } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import LoginBlock from 'calypso/blocks/login';
//import WPLogin from 'calypso/login/wp-login';

import './style.scss';

const ReaderJoinConversationDialog = ( { onClose, isVisible } ) => {
	const translate = useTranslate();
	const [ isLoginVisible, setIsLoginVisible ] = useState( false );
	const showLogin = () => {
		setIsLoginVisible( true );
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
						isTertiary
						onClick={ showLogin }
						className="reader-join-conversation-dialog__create-account-button"
					>
						{ translate( 'Create a new account' ) }
					</Button>
					<Button isLink onClick={ showLogin } className="reader-join-conversation-dialog__login">
						{ translate( 'Log in' ) }
					</Button>
				</div>
			) }
			{ isLoginVisible && <LoginBlock disableAutoFocus /> }
		</Dialog>
	);
};

export default ReaderJoinConversationDialog;
