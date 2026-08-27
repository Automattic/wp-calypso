import { fetchUser, isWpError } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
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

// A refused request means either that the session can no longer authenticate or
// that the account simply is not allowed to see this, and the error says the same
// thing in both cases. The v1 endpoints report the code as `error` and the ones
// registered through the WP REST infrastructure report it as `code`.
function isAuthorizationError( error: Error ) {
	if ( error.name === 'AuthorizationRequiredError' ) {
		return true;
	}

	if ( ! isWpError( error ) ) {
		return false;
	}

	const code = typeof error.error === 'string' ? error.error : error.code;
	return code === 'authorization_required' || code === 'rest_forbidden';
}

/**
 * Whether the session behind this screen still works.
 *
 * Asking for the current user is the only way to tell the two causes apart: it
 * succeeds for an account that is merely missing a permission, and fails the same
 * way as everything else once the session is gone.
 */
function useHasWorkingSession() {
	const { data, isPending } = useQuery( {
		queryKey: [ 'auth', 'session-probe' ],
		queryFn: () =>
			fetchUser().then(
				() => true,
				() => false
			),
		retry: false,
		gcTime: 0,
		meta: { persist: false },
	} );

	return { hasWorkingSession: data ?? false, isPending };
}

function RefusedRequestError() {
	const { hasWorkingSession, isPending } = useHasWorkingSession();

	// Better a moment of nothing than a moment of the wrong advice.
	if ( isPending ) {
		return null;
	}

	return hasWorkingSession ? <PermissionError /> : <SessionError />;
}

function PermissionError() {
	return (
		<PageLayout
			header={ <PageHeader title={ __( 'You don’t have access to this' ) } /> }
			notices={
				<Notice
					variant="error"
					actions={
						<ExternalLink href={ wpcomLink( '/help' ) }>{ __( 'Contact support' ) }</ExternalLink>
					}
				>
					{ __( 'Your account doesn’t have permission to view this page.' ) }
				</Notice>
			}
		></PageLayout>
	);
}

function SessionError() {
	// `useAuth` throws when there is no provider, and this component is the last
	// thing standing between the user and a blank screen.
	const auth = useContext( AuthContext );

	// Counts the users we failed to send to log in and left to recover by hand,
	// which is the half of DOTCOM-14911 nothing measures today. The probe has
	// confirmed the session by this point, so this is not diluted by people who
	// merely lack a permission.
	useEffect( () => {
		bumpStat( 'dashboard-error', 'dead-session' );
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
