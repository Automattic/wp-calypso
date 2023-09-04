import {
	BulkDomainUpdateStatusRetryInterval,
	DomainUpdateStatus,
	useBulkDomainUpdateStatusQuery,
} from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const defaultResult = {
	jobs: [],
	domainResults: new Map< string, DomainUpdateStatus[] >(),
};

export const useDomainBulkUpdateStatus = () => {
	const queryClient = useQueryClient();

	const [ statusUpdateInterval, setStatusUpdateInterval ] = useState(
		BulkDomainUpdateStatusRetryInterval.Disabled
	);

	const { data: bulkStatusUpdates = defaultResult, isFetched: isStatusUpdateSuccess } =
		useBulkDomainUpdateStatusQuery( statusUpdateInterval );
	const { jobs, domainResults } = bulkStatusUpdates;

	if ( isStatusUpdateSuccess ) {
		const hasJobsInProgress = jobs.some( ( job ) => ! job.complete );
		if (
			! hasJobsInProgress &&
			statusUpdateInterval !== BulkDomainUpdateStatusRetryInterval.Disabled
		) {
			setStatusUpdateInterval( BulkDomainUpdateStatusRetryInterval.Disabled );
		} else if (
			hasJobsInProgress &&
			statusUpdateInterval !== BulkDomainUpdateStatusRetryInterval.Active
		) {
			setStatusUpdateInterval( BulkDomainUpdateStatusRetryInterval.Active );
		}
	}

	async function handleRestartDomainStatusPolling() {
		// todo remove this as awaiting on the POST to start the bulk job should
		// be enough
		setTimeout( () => {
			setStatusUpdateInterval( BulkDomainUpdateStatusRetryInterval.Active );
			queryClient.invalidateQueries( { queryKey: [ 'domains', 'bulk-actions' ] } );
		}, 1000 );
	}

	return { jobs, domainResults, handleRestartDomainStatusPolling };
};
