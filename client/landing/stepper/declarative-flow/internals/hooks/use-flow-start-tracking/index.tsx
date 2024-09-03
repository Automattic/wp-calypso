import { recordTracksEvent } from '@automattic/calypso-analytics';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { STEPPER_TRACKS_EVENT_FLOW_START } from 'calypso/landing/stepper/constants';
import useSnakeCasedKeys from 'calypso/landing/stepper/utils/use-snake-cased-keys';
import { Flow } from '../../types';

export const DURATION = 20 * 60 * 1000; // 20 min

interface Params {
	flow: Flow;
	step: string;
}

interface SessionKeys {
	flowName: string | null;
	variant: string | null | undefined;
	site: string | null;
}
interface Session {
	validUntil: number;
	[ key: string ]: any;
}

const getKey = ( keys: SessionKeys ) => {
	return [ 'stepper_flow_started', keys.flowName, keys.variant, keys.site ]
		.filter( Boolean )
		.join( '_' );
};

const isExpired = ( session: Session ) => {
	return session.validUntil < Date.now();
};

const isTheFlowAlreadyStarted = ( keys: SessionKeys ) => {
	const key = getKey( keys );
	const session = JSON.parse( sessionStorage.getItem( key ) || 'null' );

	if ( session && isExpired( session ) ) {
		sessionStorage.removeItem( key );
		return null;
	}

	return session;
};

/**
 * Hook to manage the analytics of the flow
 * It will track the flow starting and store it in the local storage to avoid tracking it again if the user refreshes the page
 * Same flow with same parameters will be tracked only once whitin the DURATION time
 * returns void
 */
export const useFlowStartTracking = ( { flow, step }: Params ) => {
	const [ search ] = useSearchParams();
	const ref = search.get( 'ref' );
	const siteId = search.get( 'siteId' );
	const siteSlug = search.get( 'siteSlug' );
	const sessionKeys = useMemo(
		() => ( {
			flowName: flow.name,
			variant: flow.variantSlug,
			site: siteId || siteSlug,
		} ),
		[ flow, siteId, siteSlug ]
	);
	const tracksEventPropsFromFlow = useSnakeCasedKeys( {
		input: flow.useTracksEventProps?.()[ STEPPER_TRACKS_EVENT_FLOW_START ],
	} );

	useEffect( () => {
		if ( ! isTheFlowAlreadyStarted( sessionKeys ) ) {
			recordTracksEvent( STEPPER_TRACKS_EVENT_FLOW_START, {
				flow: flow.name,
				device: resolveDeviceTypeByViewPort(),
				ref,
				step,
				site_id: siteId,
				site_slug: siteSlug,
				variant: flow.variantSlug,
				...tracksEventPropsFromFlow,
			} );

			sessionStorage.setItem(
				getKey( sessionKeys ),
				JSON.stringify( { ...sessionKeys, validUntil: Date.now() + DURATION } )
			);
		}
	}, [ flow, ref, sessionKeys, siteId, siteSlug, step, tracksEventPropsFromFlow ] );
};
