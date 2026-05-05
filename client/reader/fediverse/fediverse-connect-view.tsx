import {
	useAuthorizeFediverseConnectionMutation,
	useEnableFediverseC2sMutation,
	useEnableFediverseFeatureMutation,
	useEnableFediverseUserActorsMutation,
	useFediverseSiteCapabilitiesQuery,
} from '@automattic/api-queries';
import { useEffect, useReducer } from 'react';
import { useDispatch } from 'calypso/state';
import { trackFediverseEvent } from './analytics';
import { CapabilityChecklist } from './connect/capability-checklist';
import { SitePickerStep } from './connect/site-picker-step';
import { WizardErrorStates } from './connect/wizard-error-states';
import { INITIAL_STATE, wizardReducer } from './connect/wizard-state-machine';
import { saveOauthState } from './oauth-state';
import type { FediverseError } from '@automattic/api-core';

function errorMessage( err: unknown ): string {
	if ( err && typeof err === 'object' && 'kind' in err ) {
		const e = err as FediverseError;
		if ( e.kind === 'bad_request' ) {
			return e.message ?? e.kind;
		}
		return e.kind;
	}
	return String( err );
}

function isPermissionDenied( err: unknown ): boolean {
	if ( err && typeof err === 'object' && 'kind' in err ) {
		const e = err as FediverseError;
		return e.kind === 'forbidden' || e.kind === 'auth_required';
	}
	return false;
}

export function FediverseConnectView() {
	const reduxDispatch = useDispatch();
	const [ state, dispatch ] = useReducer( wizardReducer, INITIAL_STATE );

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
			const message = errorMessage( capabilitiesQuery.error );
			dispatch( { type: 'CAPABILITIES_FAILED', message } );
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
						permissionDenied: false,
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
						permissionDenied: false,
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
						permissionDenied: false,
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

	switch ( state.name ) {
		case 'PICKING_SITE':
			return (
				<SitePickerStep
					onPick={ ( blogId ) => {
						reduxDispatch( trackFediverseEvent( 'CONNECT_STARTED', { blog_id: blogId } ) );
						dispatch( { type: 'PICK_SITE', blogId } );
					} }
				/>
			);
		case 'CHECKING_CAPABILITIES':
		case 'CHECKLIST_READY':
		case 'ENABLING_FEATURE':
		case 'ENABLING_C2S':
		case 'ENABLING_USER_ACTORS':
		case 'AUTHORIZING':
		case 'REDIRECTING':
		case 'COMPLETING':
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
