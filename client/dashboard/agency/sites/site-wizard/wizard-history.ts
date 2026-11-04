import { useRouter } from '@tanstack/react-router';
import { useCallback, useSyncExternalStore } from 'react';
import { useAuth } from '../../../app/auth';
import type { WizardSnapshot } from './use-site-wizard';

declare module '@tanstack/history' {
	interface HistoryState {
		agencySiteWizard?: { id: string; scope: string; snapshot?: WizardSnapshot };
	}
}

// Keep form values out of the URL and retain edited steps for browser Forward.
const entries = new Map< string, WizardSnapshot >();
const entryPrefix = Date.now().toString( 36 );
let nextEntry = 0;

export function saveWizardEntry(
	snapshot: WizardSnapshot,
	id = `wizard-${ entryPrefix }-${ ++nextEntry }`
) {
	entries.set( id, snapshot );
	return id;
}

export function useWizardHistory( previewScope: string ) {
	const { user } = useAuth();
	const scope = `${ user.ID }:${ previewScope }`;
	const { history } = useRouter();
	const location = useSyncExternalStore(
		history.subscribe,
		() => history.location,
		() => history.location
	);
	const marker = location.state.agencySiteWizard;
	// Hot updates can clear the draft cache while the browser retains its history.
	const entry: WizardSnapshot | undefined =
		marker?.scope === scope ? ( entries.get( marker.id ) ?? marker.snapshot ) : undefined;
	const push = useCallback(
		( snapshot: WizardSnapshot, replace = false ) => {
			const id = saveWizardEntry( snapshot );
			history[ replace ? 'replace' : 'push' ]( history.location.href, {
				...history.location.state,
				agencySiteWizard: { id, scope, snapshot },
			} );
			history.flush();
			return id;
		},
		[ history, scope ]
	);
	const close = () => {
		history.push( history.location.href, {
			...history.location.state,
			agencySiteWizard: undefined,
		} );
		history.flush();
	};
	return { history, marker, entry, push, close, index: location.state.__TSR_index };
}
