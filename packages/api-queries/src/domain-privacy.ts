import { disableDomainPrivacy, enableDomainPrivacy } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { domainQuery } from './domain';
import { queryClient } from './query-client';

export const domainPrivacyEnableMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: () => enableDomainPrivacy( domainName ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domainName ) );
		},
	} );

export const domainPrivacyDisableMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: () => disableDomainPrivacy( domainName ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domainName ) );
		},
	} );
