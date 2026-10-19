import { useState } from 'react';

export type Step =
	| 'start'
	| 'new'
	| 'picker'
	| 'url'
	| 'authorize'
	| 'source'
	| 'host'
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
	url: '',
	name: '',
	address: 'clientdemo',
	email: '',
	message: '',
	selected: [] as number[],
};

export default function useSiteWizard( onStart: () => void ) {
	const [ history, setHistory ] = useState< Step[] >( [ 'start' ] );
	const [ data, setData ] = useState( initialData );
	const [ error, setError ] = useState( '' );
	const [ result, setResult ] = useState( '' );
	const step = history[ history.length - 1 ];
	const change = ( patch: Partial< typeof initialData > ) => {
		setData( ( previous ) => ( { ...previous, ...patch } ) );
		setError( '' );
	};
	const go = ( next: Step ) => {
		onStart();
		setError( '' );
		setHistory( ( previous ) => [ ...previous, next ] );
	};
	const back = () => {
		setError( '' );
		setHistory( ( previous ) => ( previous.length > 1 ? previous.slice( 0, -1 ) : previous ) );
	};
	const restart = () => {
		setHistory( [ 'start' ] );
		setData( initialData );
		setError( '' );
		setResult( '' );
	};
	return { step, data, change, go, back, restart, error, setError, result, setResult };
}
