import { Subscriber } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';

type ImportJob = Subscriber.ImportJob;
type ImportJobStatus = Subscriber.ImportJobStatus;

const INTERVAL_ACTIVE = 5000;
const INTERVAL_INACTIVE = 10000;
const ACTIVE_STATE: ImportJobStatus[] = [ 'pending', 'importing' ];

export function useActiveJobRecognition( siteId: number ) {
	const { getSubscribersImports, importCsvSubscribersUpdate } = useDispatch( Subscriber.store );

	const imports =
		useSelect( ( select ) => select( Subscriber.store ).getImportJobsSelector(), [] ) || [];
	const jobs = imports.filter( ( x: ImportJob ) => ACTIVE_STATE.includes( x.status ) );
	const activeJob = jobs.length ? jobs[ 0 ] : undefined;

	useEffect( () => {
		importCsvSubscribersUpdate( activeJob );
	}, [ activeJob, importCsvSubscribersUpdate ] );

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
	}, [ activeJob, getSubscribersImports, siteId ] );

	return activeJob;
}
