import { fetchAkismetApiKey } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const akismetApiKeyQuery = () =>
	queryOptions( {
		queryKey: [ 'akismet-api-key' ],
		queryFn: () => fetchAkismetApiKey(),
	} );
