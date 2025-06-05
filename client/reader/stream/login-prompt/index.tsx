import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

interface ReaderStreamLoginPromptProps {
	redirectPath?: string;
}

const ReaderStreamLoginPrompt = ( {
	redirectPath = '/discover',
}: ReaderStreamLoginPromptProps ) => {
	const translate = useTranslate();

	const onCreateAccountClick = () => {
		recordTracksEvent( 'calypso_reader_stream_login_prompt_signup_clicked' );
		page( '/start/reader?ref=reader-lp' );
	};

	const onLoginClick = () => {
		recordTracksEvent( 'calypso_reader_stream_login_prompt_login_clicked' );
		page( `/log-in?redirect_to=${ encodeURIComponent( redirectPath ) }` );
	};

	return (
		<div className="reader-stream-login-prompt">
			<h2>{ translate( 'Join the conversation' ) }</h2>
			<p>
				{ translate(
					'Sign in to discover more great content and subscribe to your favorite blogs.'
				) }
			</p>
			<div className="reader-stream-login-prompt__buttons">
				<Button
					variant="primary"
					onClick={ onCreateAccountClick }
					className="reader-stream-login-prompt__signup-button"
				>
					{ translate( 'Create a new account' ) }
				</Button>
				<Button
					variant="link"
					onClick={ onLoginClick }
					className="reader-stream-login-prompt__login-button"
				>
					{ translate( 'Log in' ) }
				</Button>
			</div>
		</div>
	);
};

export default ReaderStreamLoginPrompt;
