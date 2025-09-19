import { fetchConnectedApplications, deleteConnectedApplication } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const connectedApplicationsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'connected-applications' ],
		queryFn: fetchConnectedApplications,
	} );

export const deleteConnectedApplicationMutation = () =>
	mutationOptions( {
		mutationFn: deleteConnectedApplication,
		onSuccess: () => queryClient.invalidateQueries( connectedApplicationsQuery() ),
	} );
