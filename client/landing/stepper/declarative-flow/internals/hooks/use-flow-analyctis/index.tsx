import { useEffect } from 'react';
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
	const session = JSON.parse( localStorage.getItem( getKey( keys ) ) || 'null' );
	if ( session && isExpired( session ) ) {
		localStorage.removeItem( getKey( keys ) );
		return null;
	}
	return session;
};

const setSession = ( keys: SessionKeys ) => {
	localStorage.setItem(
		getKey( keys ),
		JSON.stringify( { ...keys, validUntil: Date.now() + DURATION } )
	);
};

const removeAllExpired = () => {
	for ( const [ key, value ] of Object.entries( localStorage ) ) {
		if ( key.includes( 'flow_start' ) ) {
			const session = JSON.parse( value );
			if ( isExpired( session ) ) {
				localStorage.removeItem( key );
			}
		}
	}
};

/**
 * Hook to manage the analytics of the flow
 * It will track the flow starting and store it in the local storage to avoid tracking it again if the user refreshes the page
 * Same flow with same parameters will be tracked only once whitin the DURATION time
 * returns void
 */
export const useFlowAnalyctis = ( params: Params ) => {
	const [ search ] = useSearchParams();
	const { flow, step, variant } = params;
	const ref = search.get( 'ref' ) || null;
	const siteId = search.get( 'siteId' ) || null;
	const site = search.get( 'siteSlug' ) || siteId;
	const flowStarted = isTheFlowAlreadyStarted( { flow, variant, site } );

	useEffect( () => {
		if ( ! flow ) {
			return;
		}

		if ( flowStarted ) {
			return;
		}

		setSession( { flow, variant, site } );
		recordFlowStart( flow, step, variant, { ref } );
	}, [ flow ] );

	useEffect( () => {
		removeAllExpired();
	}, [] );
};
