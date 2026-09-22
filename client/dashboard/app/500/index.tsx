import { isWpError } from '@automattic/api-core';
import { Button, ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useContext, useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
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

// The endpoint reports why it refused. Recording that beside what the session
// check independently found is what makes the two comparable.
function describeRefusal( error: Error ) {
	if ( ! isWpError( error ) ) {
		return { error_name: error.name };
	}

	const data =
		typeof error.data === 'object' && error.data !== null
			? ( error.data as Record< string, unknown > )
			: undefined;

	return {
		error_name: error.name,
		status: error.statusCode,
		code: typeof error.error === 'string' ? error.error : error.code,
		// v1 carries this at the top level, the WP REST envelope nests it.
		reason: error.reason ?? data?.reason,
	};
}

function RefusedRequestError( { error }: { error: Error } ) {
	const { data: sessionState } = useSessionStateQuery();

	useEffect( () => {
		if ( ! sessionState ) {
			return;
		}

		bumpStat( 'dashboard-error', `refused:${ sessionState }` );

		// This endpoint needs the session that may be the very thing that is broken, so
		// a dead session is the case least likely to be recorded here. The stat above
		// is the one that always arrives.
		logToLogstash( {
			feature: 'calypso_client',
			message: 'Dashboard refused request',
			severity: 'debug',
			tags: [ 'dashboard' ],
			extra: {
				type: 'dashboard_refused_request',
				session_state: sessionState,
				...describeRefusal( error ),
				path: window.location.href,
			},
		} ).catch( () => {} );
	}, [ sessionState, error ] );

	// Until the session is known to be fine, assume it is not: a stalled check must
	// not leave the user staring at nothing.
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

function UnknownError( { error }: { error: Error } ) {
	if ( isWpError( error ) && error.error === 'reauthorization_required' ) {
		return <ReauthRedirect />;
	}

	if ( isAuthorizationError( error ) ) {
		return <RefusedRequestError error={ error } />;
	}

	return <GenericError error={ error } />;
}

export default UnknownError;
