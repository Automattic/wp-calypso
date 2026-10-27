import {
	fetchDomainContactInformation,
	updateDomainContactInformation,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const domainContactInformationQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'domain-contact-information' ],
		queryFn: fetchDomainContactInformation,
		meta: { persist: false },
	} );

export const domainContactInformationMutation = () =>
	mutationOptions( {
		meta: { statId: 'domain-contact-info-update' },
		mutationFn: updateDomainContactInformation,
		onSuccess: () => queryClient.invalidateQueries( domainContactInformationQuery() ),
	} );
