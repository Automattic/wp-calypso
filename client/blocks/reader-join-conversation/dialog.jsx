import { Dialog } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import useLoginWindow from 'calypso/components/login-window';
import './style.scss';

const ReaderJoinConversationDialog = ( { onClose, isVisible } ) => {
	const translate = useTranslate();

	const { login, createAccount } = useLoginWindow( {
		onLoginSuccess: () => window.location.reload(),
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
					onClick={ createAccount }
					className="reader-join-conversation-dialog__create-account-button"
				>
					{ translate( 'Create a new account' ) }
				</Button>
				<br />
				<Button isLink onClick={ login } className="reader-join-conversation-dialog__login">
					{ translate( 'Log in' ) }
				</Button>
			</div>
		</Dialog>
	);
};

export default ReaderJoinConversationDialog;
