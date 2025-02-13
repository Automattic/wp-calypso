import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';

// The desktop app will intercept this URL and start the login in the user's external browser.
const loginUrl = '/desktop-start-login';

interface Props {
	error?: string;
}

/**
 * Initial page of the login flow of the WordPress.com Desktop app.
 *
 * Renders a button that when clicked sends the user to their browser (outside the desktop app),
 * so that they can log in to WordPress.com.
 */
export default function DesktopLoginStart( props: Props ) {
	const translate = useTranslate();
	const [ error, setError ] = useState< string | undefined >( props.error );

	return (
		<Main className="desktop-login">
			<div className="desktop-login__content">
				{ error ? (
					<Notice status="is-error" onDismissClick={ () => setError( undefined ) }>
						{ translate( 'We were not able to log you in. Please try again.' ) }
					</Notice>
				) : undefined }
				<FormattedHeader
					headerText={ translate( 'Log in' ) }
					subHeaderText={ translate( 'Authorize with WordPress.com to get started' ) }
					brandFont
				/>
				<Button variant="primary" href={ loginUrl } onClick={ () => setError( undefined ) }>
					{ translate( 'Log in with WordPress.com' ) }
				</Button>
			</div>
		</Main>
	);
}
