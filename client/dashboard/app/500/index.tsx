import { isWpError } from '@automattic/api-core';
import { Button, ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useContext, useEffect } from 'react';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { reauthRequiredLink, wpcomLink } from '../../utils/link';
import { bumpStat } from '../analytics';
import { AuthContext } from '../auth';

function ReauthRedirect() {
	useEffect( () => {
		window.location.href = reauthRequiredLink();
	}, [] );

	return null;
}

// `authorization_required` covers both a session that can no longer authenticate
// and an account that is authenticated but not allowed to see something, and the
// API gives us no way to tell them apart. So suggest the fix for the first rather
// than diagnosing either, and offer support for when it does not help.
function isAuthorizationError( error: Error ) {
	return (
		error.name === 'AuthorizationRequiredError' ||
		( isWpError( error ) && error.error === 'authorization_required' )
	);
}

function RefusedRequestError() {
	// `useAuth` throws when there is no provider, and this component is the last
	// thing standing between the user and a blank screen.
	const auth = useContext( AuthContext );

	// Counts the users we failed to send to log in and left to recover by hand,
	// which is the half of DOTCOM-14911 nothing measures today.
	useEffect( () => {
		bumpStat( 'dashboard-error', 'refused-request' );
	}, [] );

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
			header={ <PageHeader title={ __( 'Something went wrong' ) } /> }
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
						'We’re having trouble accessing data from your account at the moment. Please log out and log back in to try again.'
					) }
				</Notice>
			}
		></PageLayout>
	);
}

function GenericError( { error }: { error: Error } ) {
	return (
		<PageLayout
			header={
				<PageHeader title={ __( '500 Error' ) } description={ __( 'Something wrong happened.' ) } />
			}
			notices={
				<Notice
					variant="error"
					actions={
						<ExternalLink href={ wpcomLink( '/help' ) }>{ __( 'Contact support' ) }</ExternalLink>
					}
				>
					{ error.message }
				</Notice>
			}
		></PageLayout>
	);
}

/**
 * The dashboard's last-resort error screen.
 *
 * Route error boundaries fall back to this, and the area-specific error
 * components (site, domain) delegate to it for anything they do not recognise.
 * Only add a branch here for a failure that can happen anywhere in the app;
 * anything scoped to one area belongs in that area's error component.
 */
function UnknownError( { error }: { error: Error } ) {
	if ( isWpError( error ) && error.error === 'reauthorization_required' ) {
		return <ReauthRedirect />;
	}

	if ( isAuthorizationError( error ) ) {
		return <RefusedRequestError />;
	}

	return <GenericError error={ error } />;
}

export default UnknownError;
