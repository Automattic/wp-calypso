import { Subscriber } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function useHasStaleImportJobs() {
	const imports =
		useSelect( ( select ) => select( Subscriber.store ).getImportJobsSelector(), [] ) || [];
	const pendingImports = imports.filter(
		( importJob ) => importJob.status === 'pending' || importJob.status === 'importing'
	);

	if ( ! pendingImports ) {
		return false;
	}

	const now = new Date();
	const staleJob = pendingImports
		.filter( ( importJob ) => !! importJob.scheduled_at )
		.find( ( importJob ) => {
			const jobDate = new Date( importJob.scheduled_at || 0 );
			return now.getTime() - jobDate.getTime() > DAY_IN_MS;
		} );

	return !! staleJob;
}
