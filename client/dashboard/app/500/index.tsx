import { isWpError } from '@automattic/api-core';
import { Button, ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useContext, useEffect } from 'react';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { reauthRequiredLink, wpcomLink } from '../../utils/link';
import { bumpStat } from '../analytics';
import { AuthContext, useSessionStateQuery } from '../auth';

function ReauthRedirect() {
	useEffect( () => {
		window.location.href = reauthRequiredLink();
	}, [] );

	return null;
}

// `authorization_required` covers both a dead session and a plain permission
// error. v1 endpoints report the code as `error`, WP REST ones as `code`.
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

function RefusedRequestError() {
	const { data: sessionState, isPending } = useSessionStateQuery();

	if ( isPending ) {
		return null;
	}

	return sessionState === 'alive' ? <PermissionError /> : <SessionError />;
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
	const auth = useContext( AuthContext );

	useEffect( () => {
		bumpStat( 'dashboard-error', 'dead-session' );
	}, [] );

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
