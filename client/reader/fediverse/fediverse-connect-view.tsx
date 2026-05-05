import {
	useAuthorizeFediverseConnectionMutation,
	useEnableFediverseC2sMutation,
	useEnableFediverseFeatureMutation,
	useEnableFediverseUserActorsMutation,
	useFediverseSiteCapabilitiesQuery,
} from '@automattic/api-queries';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useReducer } from 'react';
import { useDispatch } from 'calypso/state';
import { trackFediverseEvent } from './analytics';
import { CapabilityChecklist } from './connect/capability-checklist';
import { SitePickerStep } from './connect/site-picker-step';
import { WizardErrorStates } from './connect/wizard-error-states';
import { INITIAL_STATE, wizardReducer } from './connect/wizard-state-machine';
import { saveOauthState } from './oauth-state';
import type { FediverseError } from '@automattic/api-core';

// Returns a server-provided human-readable message when one is available
// (only `bad_request` carries one). For closed-set kinds we return an empty
// string so the wizard's error card shows only the translated step title and
// doesn't leak machine codes like `forbidden` / `not_found` to users. The
// `kind` is still carried separately for telemetry via `isPermissionDenied`.
function errorMessage( err: unknown ): string {
	if ( err && typeof err === 'object' && 'kind' in err ) {
		const e = err as FediverseError;
		if ( e.kind === 'bad_request' && e.message ) {
			return e.message;
		}
	}
	return '';
}

function isPermissionDenied( err: unknown ): boolean {
	if ( err && typeof err === 'object' && 'kind' in err ) {
		const e = err as FediverseError;
		return e.kind === 'forbidden' || e.kind === 'auth_required';
	}
	return false;
}

interface Props {
	query?: { error?: string };
}

export function FediverseConnectView( { query }: Props = {} ) {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const [ state, dispatch ] = useReducer( wizardReducer, INITIAL_STATE );

	const callbackError = query?.error;

	// Fire capabilities query whenever blogId is set; the query disables itself when blogId is 0.
	const capabilitiesQuery = useFediverseSiteCapabilitiesQuery( state.blogId ?? 0 );

	const enableFeature = useEnableFediverseFeatureMutation( state.blogId ?? 0 );
	const enableC2s = useEnableFediverseC2sMutation( state.blogId ?? 0 );
	const enableUserActors = useEnableFediverseUserActorsMutation( state.blogId ?? 0 );
	const authorize = useAuthorizeFediverseConnectionMutation();

	// CHECKING_CAPABILITIES → on settle, dispatch.
	useEffect( () => {
		if ( state.name !== 'CHECKING_CAPABILITIES' ) {
			return;
		}
		if ( capabilitiesQuery.isSuccess && capabilitiesQuery.data ) {
			reduxDispatch( trackFediverseEvent( 'CAPABILITY_CHECK', { blog_id: state.blogId } ) );
			dispatch( { type: 'CAPABILITIES_LOADED', capabilities: capabilitiesQuery.data } );
		} else if ( capabilitiesQuery.isError ) {
			dispatch( {
				type: 'CAPABILITIES_FAILED',
				message: errorMessage( capabilitiesQuery.error ),
				permissionDenied: isPermissionDenied( capabilitiesQuery.error ),
			} );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ state.name, capabilitiesQuery.isSuccess, capabilitiesQuery.isError ] );

	// ENABLING_FEATURE → fire mutation → on settle, refetch caps then dispatch ENABLE_STEP_DONE / FAILED.
	useEffect( () => {
		if ( state.name !== 'ENABLING_FEATURE' || ! state.blogId ) {
			return;
		}
		enableFeature.mutate( undefined, {
			onSuccess: async () => {
				reduxDispatch( trackFediverseEvent( 'FEATURE_ENABLED', { blog_id: state.blogId } ) );
				const refetched = await capabilitiesQuery.refetch();
				if ( refetched.data ) {
					dispatch( {
						type: 'ENABLE_STEP_DONE',
						step: 'feature',
						capabilities: refetched.data,
					} );
				} else {
					dispatch( {
						type: 'ENABLE_STEP_FAILED',
						step: 'feature',
						message: errorMessage( refetched.error ),
						permissionDenied: isPermissionDenied( refetched.error ),
					} );
				}
			},
			onError: ( err ) => {
				dispatch( {
					type: 'ENABLE_STEP_FAILED',
					step: 'feature',
					message: errorMessage( err ),
					permissionDenied: isPermissionDenied( err ),
				} );
			},
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ state.name ] );

	// ENABLING_C2S → fire mutation → on settle, refetch caps then dispatch ENABLE_STEP_DONE / FAILED.
	useEffect( () => {
		if ( state.name !== 'ENABLING_C2S' || ! state.blogId ) {
			return;
		}
		enableC2s.mutate( undefined, {
			onSuccess: async () => {
				reduxDispatch( trackFediverseEvent( 'C2S_ENABLED', { blog_id: state.blogId } ) );
				const refetched = await capabilitiesQuery.refetch();
				if ( refetched.data ) {
					dispatch( {
						type: 'ENABLE_STEP_DONE',
						step: 'c2s',
						capabilities: refetched.data,
					} );
				} else {
					dispatch( {
						type: 'ENABLE_STEP_FAILED',
						step: 'c2s',
						message: errorMessage( refetched.error ),
						permissionDenied: isPermissionDenied( refetched.error ),
					} );
				}
			},
			onError: ( err ) => {
				dispatch( {
					type: 'ENABLE_STEP_FAILED',
					step: 'c2s',
					message: errorMessage( err ),
					permissionDenied: isPermissionDenied( err ),
				} );
			},
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ state.name ] );

	// ENABLING_USER_ACTORS → fire mutation → on settle, refetch caps then dispatch ENABLE_STEP_DONE / FAILED.
	useEffect( () => {
		if ( state.name !== 'ENABLING_USER_ACTORS' || ! state.blogId ) {
			return;
		}
		enableUserActors.mutate( undefined, {
			onSuccess: async () => {
				reduxDispatch( trackFediverseEvent( 'USER_ACTORS_ENABLED', { blog_id: state.blogId } ) );
				const refetched = await capabilitiesQuery.refetch();
				if ( refetched.data ) {
					dispatch( {
						type: 'ENABLE_STEP_DONE',
						step: 'user_actors',
						capabilities: refetched.data,
					} );
				} else {
					dispatch( {
						type: 'ENABLE_STEP_FAILED',
						step: 'user_actors',
						message: errorMessage( refetched.error ),
						permissionDenied: isPermissionDenied( refetched.error ),
					} );
				}
			},
			onError: ( err ) => {
				dispatch( {
					type: 'ENABLE_STEP_FAILED',
					step: 'user_actors',
					message: errorMessage( err ),
					permissionDenied: isPermissionDenied( err ),
				} );
			},
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ state.name ] );

	// AUTHORIZING → fire authorize mutation → AUTHORIZE_DONE / FAILED.
	useEffect( () => {
		if ( state.name !== 'AUTHORIZING' || ! state.blogId ) {
			return;
		}
		authorize.mutate(
			{ blog_id: state.blogId, actor: 'user' },
			{
				onSuccess: ( data ) => {
					saveOauthState( { state: data.state, blog_id: state.blogId! } );
					reduxDispatch( trackFediverseEvent( 'AUTHORIZE_STARTED', { blog_id: state.blogId } ) );
					dispatch( { type: 'AUTHORIZE_DONE', authorizeUrl: data.authorize_url } );
				},
				onError: ( err ) => {
					dispatch( { type: 'AUTHORIZE_FAILED', message: errorMessage( err ) } );
				},
			}
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ state.name ] );

	// REDIRECTING → navigate to the authorize URL.
	useEffect( () => {
		if ( state.name !== 'REDIRECTING' || ! state.authorizeUrl ) {
			return;
		}
		window.location.assign( state.authorizeUrl );
	}, [ state.name, state.authorizeUrl ] );

	// Surface an error banner when the OAuth callback redirected back here
	// with `?error=` (provider-denied, state mismatch, expired link, etc.).
	// Hide it as soon as the user starts a new attempt to avoid stale copy.
	const showCallbackError = callbackError && state.name === 'PICKING_SITE';
	const callbackErrorBanner = showCallbackError ? (
		<p role="alert" className="fediverse-connect__callback-error">
			{ callbackErrorMessage( callbackError, translate ) }
		</p>
	) : null;

	switch ( state.name ) {
		case 'PICKING_SITE':
			return (
				<>
					{ callbackErrorBanner }
					<SitePickerStep
						onPick={ ( blogId ) => {
							reduxDispatch( trackFediverseEvent( 'CONNECT_STARTED', { blog_id: blogId } ) );
							dispatch( { type: 'PICK_SITE', blogId } );
						} }
					/>
				</>
			);
		case 'CHECKING_CAPABILITIES':
		case 'CHECKLIST_READY':
		case 'ENABLING_FEATURE':
		case 'ENABLING_C2S':
		case 'ENABLING_USER_ACTORS':
		case 'AUTHORIZING':
		case 'REDIRECTING':
			return (
				<CapabilityChecklist
					state={ state }
					onConnect={ () => dispatch( { type: 'CONNECT_CLICKED' } ) }
				/>
			);
		case 'ERROR':
			return (
				<WizardErrorStates
					state={ state }
					onRetry={ () => dispatch( { type: 'RETRY_FROM_ERROR' } ) }
					onReset={ () => dispatch( { type: 'RESET' } ) }
				/>
			);
		case 'DONE':
		default:
			return null;
	}
}

function callbackErrorMessage( kind: string, t: ReturnType< typeof useTranslate > ): string {
	switch ( kind ) {
		case 'access_denied':
			return t( 'You declined the authorization on the site.' ) as string;
		case 'state_mismatch':
		case 'state_expired':
		case 'missing_params':
			return t(
				'This authorization link has expired or doesn’t match. Please try connecting again.'
			) as string;
		case 'auth_failed':
		case 'auth_required':
		case 'forbidden':
		case 'not_found':
			return t( 'Connection couldn’t be completed. Please try again.' ) as string;
		case 'rate_limited':
			return t( 'Too many attempts. Please wait a moment and try again.' ) as string;
		case 'upstream_unavailable':
			return t( 'The Fediverse site is temporarily unavailable. Please try again.' ) as string;
		default:
			return t( 'Something went wrong. Please try again.' ) as string;
	}
}
