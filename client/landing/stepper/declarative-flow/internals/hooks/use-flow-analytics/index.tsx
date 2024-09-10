import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recordFlowStart } from '../../analytics/record-flow-start';

export const DURATION = 20 * 60 * 1000; // 20 min

interface Params {
	flow: string | null;
	variant?: string;
	step: string;
}

interface SessionKeys {
	flow: string | null;
	variant: string | null | undefined;
	site: string | null;
}
interface Session {
	validUntil: number;
	[ key: string ]: any;
}

const getKey = ( keys: SessionKeys ) => {
	return [ 'stepper_flow_started', keys.flow, keys.variant, keys.site ]
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

const startSession = ( keys: SessionKeys, extra: Record< string, any > ) => {
	const { flow } = keys;
	const key = getKey( keys );

	recordFlowStart( flow!, extra );

	sessionStorage.setItem( key, JSON.stringify( { ...keys, validUntil: Date.now() + DURATION } ) );
};

/**
 * Hook to manage the analytics of the flow
 * It will track the flow starting and store it in the local storage to avoid tracking it again if the user refreshes the page
 * Same flow with same parameters will be tracked only once whitin the DURATION time
 * returns void
 */
export const useFlowAnalytics = ( params: Params ) => {
	const [ search ] = useSearchParams();
	const { flow, step, variant } = params;
	const ref = search.get( 'ref' );
	const siteId = search.get( 'siteId' );
	const siteSlug = search.get( 'siteSlug' );

	const sessionKeys = useMemo(
		() => ( {
			flow,
			variant,
			site: siteId || siteSlug,
		} ),
		[ flow, siteId, siteSlug, variant ]
	);

	const flowStarted = isTheFlowAlreadyStarted( sessionKeys );
	const extraTrackingParams = useMemo(
		() => ( {
			ref,
			step,
			site_id: siteId,
			site_slug: siteSlug,
			variant,
		} ),
		[ ref, siteId, siteSlug, step, variant ]
	);

	useEffect( () => {
		if ( ! flowStarted && flow ) {
			startSession( sessionKeys, extraTrackingParams );
		}
	}, [ extraTrackingParams, flow, flowStarted, sessionKeys ] );
};
