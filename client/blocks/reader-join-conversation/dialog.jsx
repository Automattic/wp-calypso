import { Dialog } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import useLoginWindow from 'calypso/components/login-window';
import './style.scss';

const ReaderJoinConversationDialog = ( { onClose, isVisible } ) => {
	const translate = useTranslate();
	//create function to handle when login is complete

	const { login } = useLoginWindow( {
		onLoginSuccess: () => window.location.reload(),
		domain: 'wpcalypso.wordpress.com', //Need to use this while testing locally (also needs to be sandboxed)
	} );

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
			<div className="reader-join-conversation-dialog__content">
				<h1>{ translate( 'Join the conversation' ) }</h1>
				<p>{ translate( 'Sign in to like, comment, reblog, and follow your favorite blogs.' ) }</p>
				<Button
					isPrimary
					onClick={ login }
					className="reader-join-conversation-dialog__create-account-button"
				>
					{ translate( 'Create a new account' ) }
				</Button>
				<Button isLink onClick={ login } className="reader-join-conversation-dialog__login">
					{ translate( 'Log in' ) }
				</Button>
			</div>
		</Dialog>
	);
};

export default ReaderJoinConversationDialog;
