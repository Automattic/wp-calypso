import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { parseSiteList, sampleSiteList } from './site-intake';
import { saveWizardEntry, useWizardHistory } from './wizard-history';
import type { IntakeSite } from './site-intake';

export type Step =
	| 'start'
	| 'new'
	| 'picker'
	| 'url'
	| 'authorize'
	| 'connecting'
	| 'source'
	| 'review'
	| 'host'
	| 'method'
	| 'setup'
	| 'referral-sent'
	| 'requested'
	| 'verify'
	| 'success';
export type Journey = 'connect' | 'migrate' | 'development' | 'hosted';
export type Host = 'wpcom' | 'pressable';
export type Billing = 'existing' | 'agency' | 'client';

const initialData = {
	journey: 'connect' as Journey,
	host: 'wpcom' as Host,
	billing: 'agency' as Billing,
	method: 'concierge' as 'concierge' | 'self',
	plugin: 'a4a' as 'a4a' | 'jetpack',
	connectionChecks: 0,
	url: '',
	name: '',
	address: 'clientdemo',
	email: '',
	message: '',
	selected: [] as number[],
	intake: '',
	sites: [] as IntakeSite[],
	chosen: [] as string[],
	completed: [] as string[],
	duplicates: 0,
};

export interface WizardSnapshot {
	session: number;
	history: Step[];
	data: typeof initialData;
	result: string;
}

let nextSession = Date.now();
const createInitialSnapshot = (): WizardSnapshot => ( {
	session: ++nextSession,
	history: [ 'start' ],
	data: initialData,
	result: '',
} );

export interface WizardJump {
	step: Step;
	journey: Journey;
	host?: Host;
	method?: 'concierge' | 'self';
	billing?: Billing;
}
export function jumpHistory( target: WizardJump ): Step[] {
	let path: Step[] = [ 'start', 'url', 'review', 'authorize', 'connecting', 'success' ];
	if ( target.journey === 'migrate' ) {
		path = [
			'start',
			'source',
			'review',
			'host',
			'method',
			'setup',
			...( target.billing === 'client' ? [ 'referral-sent' as const ] : [] ),
			...( target.method !== 'self' ? [ 'requested' as const ] : [] ),
			'verify',
			'success',
		];
	} else if ( target.journey === 'development' || target.journey === 'hosted' ) {
		path = [
			'start',
			'new',
			...( target.journey === 'hosted' ? [ 'host' as const ] : [] ),
			'setup',
			...( target.billing === 'client' ? [ 'referral-sent' as const ] : [] ),
			'success',
		];
	}
	if ( target.step === 'picker' ) {
		return [ 'start', 'url', 'picker' ];
	}
	return path.slice( 0, path.indexOf( target.step ) + 1 );
}

export default function useSiteWizard( onStart: () => void, scope: string ) {
	const navigation = useWizardHistory( scope );
	const { entry, marker, index, push: pushHistory } = navigation;
	const [ snapshot, setSnapshot ] = useState( () => navigation.entry ?? createInitialSnapshot() );
	const current = useRef( snapshot );
	const entryId = useRef< string | undefined >( undefined );
	const historyIndex = useRef( navigation.index );
	const [ error, setError ] = useState( '' );
	const { history, data, result } = snapshot;
	const step = history[ history.length - 1 ];
	useLayoutEffect( () => {
		const delta = index - historyIndex.current;
		historyIndex.current = index;
		if ( entry && marker ) {
			let restored = entry;
			if (
				restored.session === current.current.session &&
				restored.data !== current.current.data
			) {
				restored = { ...restored, data: current.current.data };
				saveWizardEntry( restored, marker.id );
			}
			current.current = restored;
			entryId.current = marker.id;
			setSnapshot( restored );
			setError( '' );
		} else if ( delta < 0 && current.current.history.length > 1 ) {
			const restored = {
				...current.current,
				history: current.current.history.slice(
					0,
					Math.max( 1, current.current.history.length + delta )
				),
			};
			current.current = restored;
			setSnapshot( restored );
			entryId.current = pushHistory( restored, true );
			setError( '' );
		}
	}, [ entry, marker, index, pushHistory ] );
	const update = ( next: WizardSnapshot ) => {
		current.current = next;
		setSnapshot( next );
		if ( entryId.current ) {
			saveWizardEntry( next, entryId.current );
		}
	};
	const push = ( next: WizardSnapshot ) => {
		if ( ! entryId.current || ! navigation.entry ) {
			navigation.push( current.current, true );
		}
		current.current = next;
		setSnapshot( next );
		entryId.current = navigation.push( next );
	};
	const change = ( patch: Partial< typeof initialData > ) => {
		update( { ...current.current, data: { ...current.current.data, ...patch } } );
		setError( '' );
	};
	const setResult = ( result: string ) => update( { ...current.current, result } );
	const go = ( next: Step ) => {
		onStart();
		setError( '' );
		push( { ...current.current, history: [ ...current.current.history, next ] } );
	};
	const back = () => {
		setError( '' );
		if ( current.current.history.length > 1 ) {
			navigation.history.back();
		}
	};
	const restart = () => {
		push( createInitialSnapshot() );
		setError( '' );
	};
	const navigationRef = useRef( navigation );
	navigationRef.current = navigation;
	const jump = useCallback( ( target: WizardJump ) => {
		const { sites } = parseSiteList( sampleSiteList );
		const portfolio = target.journey === 'connect' || target.journey === 'migrate';
		const chosen = portfolio ? sites.slice( 0, 3 ).map( ( site ) => site.id ) : [];
		const data = {
			...initialData,
			...target,
			intake: portfolio ? sampleSiteList : '',
			sites: portfolio ? sites : [],
			chosen,
			completed: target.step === 'success' ? chosen : [],
			url: sites[ 0 ].url,
			name: 'Juniper Studio',
			email: 'client@example.com',
		};
		const history = jumpHistory( target );
		const path = history.length ? history : [ 'start' as const, target.step ];
		const session = ++nextSession;
		for ( let index = 0; index < path.length; index++ ) {
			const next = { session, history: path.slice( 0, index + 1 ), data, result: '' };
			entryId.current = navigationRef.current.push( next, index === 0 );
			current.current = next;
		}
		setSnapshot( current.current );
		setError( '' );
	}, [] );
	return { step, data, change, go, back, restart, jump, error, setError, result, setResult };
}
