import { Dialog } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import WordPressLogo from 'calypso/components/wordpress-logo';
import useLoginWindow from 'calypso/data/reader/use-login-window';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

import './style.scss';

const ReaderJoinConversationDialog = ( { onClose, isVisible, onLoginSuccess } ) => {
	const translate = useTranslate();

	const { login, createAccount } = useLoginWindow( { onLoginSuccess: onLoginSuccess } );

	const onLoginClick = () => {
		recordTracksEvent( 'calypso_reader_dialog_login_clicked' );
		login();
	};

	const onCreateAccountClick = () => {
		recordTracksEvent( 'calypso_reader_dialog_create_account_clicked' );
		createAccount();
	};

	return (
		<Dialog
			additionalClassNames="reader-join-conversation-dialog"
			isVisible={ isVisible }
			onClose={ onClose }
			showCloseIcon={ true }
			label={ translate( 'Join the conversation' ) }
			shouldCloseOnEsc={ true }
		>
			<div className="reader-join-conversation-dialog__content">
				<WordPressLogo size={ 32 } />
				<h1>{ translate( 'Join the conversation' ) }</h1>
				<p>{ translate( 'Sign in to like, comment, reblog, and follow your favorite blogs.' ) }</p>
				<Button
					isPrimary
					onClick={ onCreateAccountClick }
					className="reader-join-conversation-dialog__create-account-button"
				>
					{ translate( 'Create a new account' ) }
				</Button>
				<Button isLink onClick={ onLoginClick } className="reader-join-conversation-dialog__login">
					{ translate( 'Log in' ) }
				</Button>
			</div>
		</Dialog>
	);
};

export default ReaderJoinConversationDialog;
