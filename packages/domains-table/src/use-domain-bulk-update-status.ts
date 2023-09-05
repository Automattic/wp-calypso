import {
	BulkDomainUpdateStatusRetryInterval,
	DomainUpdateStatus,
	useBulkDomainUpdateStatusQuery,
} from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const defaultResult = {
	completedJobs: [],
	domainResults: new Map< string, DomainUpdateStatus[] >(),
};

export const useDomainBulkUpdateStatus = () => {
	const queryClient = useQueryClient();

	const [ statusUpdateInterval, setStatusUpdateInterval ] = useState(
		BulkDomainUpdateStatusRetryInterval.Disabled
	);

	const { data: bulkStatusUpdates = defaultResult, isFetched } =
		useBulkDomainUpdateStatusQuery( statusUpdateInterval );
	const { completedJobs, domainResults } = bulkStatusUpdates;

	if ( isFetched ) {
		const hasJobsInProgress = domainResults.size > 0;
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
		}, 1 );
	}

	return { completedJobs, domainResults, handleRestartDomainStatusPolling };
};
