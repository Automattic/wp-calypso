import { isWpError } from '@automattic/api-core';
import { Button, ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useContext } from 'react';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { reauthRequiredLink, wpcomLink } from '../../utils/link';
import { AuthContext } from '../auth';

function isAuthorizationError( error: Error ) {
	return (
		error.name === 'AuthorizationRequiredError' ||
		( isWpError( error ) && error.error === 'authorization_required' )
	);
}

function SessionError() {
	// `useAuth` throws when there is no provider, and this component is the last
	// thing standing between the user and a blank screen.
	const auth = useContext( AuthContext );

	// Logging out loads a chunk and clears stored state, either of which can fail
	// in the very state that got the user here. Send them to log in regardless, so
	// the button is never a dead end.
	const handleLogout = async () => {
		try {
			await auth?.logout();
		} catch {
			window.location.href = wpcomLink( '/log-in' );
		}
	};

	return (
		<PageLayout
			header={ <PageHeader title={ __( 'There’s a problem with your session' ) } /> }
			notices={
				<Notice
					variant="error"
					actions={
						<>
							{ auth ? (
								<Button variant="primary" onClick={ handleLogout }>
									{ __( 'Log out' ) }
								</Button>
							) : (
								<Button variant="primary" href={ wpcomLink( '/log-in' ) }>
									{ __( 'Log in again' ) }
								</Button>
							) }
							<ExternalLink href={ wpcomLink( '/help' ) }>{ __( 'Contact support' ) }</ExternalLink>
						</>
					}
				>
					{ __(
						'We’re having trouble accessing data from your account at the moment. Please log out and log back in to try again. We apologize for the error.'
					) }
				</Notice>
			}
		></PageLayout>
	);
}

function UnknownError( { error }: { error: Error } ) {
	if ( isWpError( error ) && error.error === 'reauthorization_required' ) {
		window.location.href = reauthRequiredLink();
		return null;
	}

	if ( isAuthorizationError( error ) ) {
		return <SessionError />;
	}

	return (
		<PageLayout
			header={
				<PageHeader title={ __( '500 Error' ) } description={ __( 'Something wrong happened.' ) } />
			}
			notices={ <Notice variant="error">{ error.message }</Notice> }
		></PageLayout>
	);
}

export default UnknownError;
