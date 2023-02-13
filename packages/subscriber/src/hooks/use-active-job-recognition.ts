import { Subscriber } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { SUBSCRIBER_STORE } from '../store';
import type { SubscriberSelect } from '@automattic/data-stores';

type ImportJob = Subscriber.ImportJob;
type ImportJobStatus = Subscriber.ImportJobStatus;

export function useActiveJobRecognition( siteId: number ) {
	const INTERVAL_ACTIVE = 1000;
	const INTERVAL_INACTIVE = 5000;
	const ACTIVE_STATE: ImportJobStatus[] = [ 'pending', 'importing' ];
	const { getSubscribersImports, importCsvSubscribersUpdate } = useDispatch( SUBSCRIBER_STORE );

	const imports =
		useSelect(
			( s ) => ( s( SUBSCRIBER_STORE ) as SubscriberSelect ).getImportJobsSelector(),
			[]
		) || [];
	const jobs = imports.filter( ( x: ImportJob ) => ACTIVE_STATE.includes( x.status ) );
	const activeJob = jobs.length ? jobs[ 0 ] : undefined;

	useEffect( () => {
		importCsvSubscribersUpdate( activeJob );
	}, [ activeJob?.status ] );

	useEffect( () => {
		const interval = setInterval(
			() => {
				getSubscribersImports( siteId );
			},
			activeJob ? INTERVAL_ACTIVE : INTERVAL_INACTIVE
		);

		return () => {
			clearInterval( interval );
		};
	}, [ activeJob?.status ] );

	return activeJob;
}
