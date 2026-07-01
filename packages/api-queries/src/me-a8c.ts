import { fetchIsAutomattician } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const isAutomatticianQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'is-automattician' ],
		queryFn: fetchIsAutomattician,
	} );
