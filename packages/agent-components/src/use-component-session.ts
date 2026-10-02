import { useEffect, useRef, useState, useSyncExternalStore } from '@wordpress/element';
import { ComponentSession } from './component-session';
import type { ComponentSessionOptions, ComponentSessionSnapshot } from './component-session';

const emptySnapshot: ComponentSessionSnapshot = {
	result: null,
	phase: 'failed',
	error: null,
};
const getEmptySnapshot = () => emptySnapshot;
const subscribeEmpty = () => () => {};
const submitEmpty = async () => {};
const failEmpty = () => {};

/** Owns the live confirmation lifetime so replaced or unmounted cards cannot continue the chat. */
export function useComponentSession( options: ComponentSessionOptions ) {
	const initialOptions = useRef( options );
	initialOptions.current = options;
	const instanceId = options.result.instanceId;
	const [ current, setCurrent ] = useState< {
		instanceId: string;
		controller: ComponentSession;
	} | null >( null );
	const session = current?.instanceId === instanceId ? current.controller : null;
	useEffect( () => {
		const controller = new ComponentSession( initialOptions.current );
		setCurrent( { instanceId, controller } );
		return () => controller.dispose();
	}, [ instanceId ] );
	useEffect( () => {
		session?.updateLocale( options.locale );
	}, [ session, options.locale ] );
	useEffect( () => {
		session?.updateMessages( options.messages );
	}, [ session, options.messages ] );
	const snapshot = useSyncExternalStore(
		session?.subscribe ?? subscribeEmpty,
		session?.getSnapshot ?? getEmptySnapshot,
		session?.getSnapshot ?? getEmptySnapshot
	);
	return {
		...snapshot,
		submit: session?.submit ?? submitEmpty,
		failPresentation: session?.failPresentation ?? failEmpty,
	};
}
