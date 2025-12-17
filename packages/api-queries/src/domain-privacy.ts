import {
	disableDomainPrivacy,
	discloseDomainPrivacy,
	enableDomainPrivacy,
	redactDomainPrivacy,
	type Domain,
} from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { domainQuery } from './domain';
import { queryClient } from './query-client';

export const domainPrivacySaveMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( enable_privacy: boolean ) =>
			enable_privacy ? enableDomainPrivacy( domainName ) : disableDomainPrivacy( domainName ),
		onSuccess: ( _, enable_privacy: boolean ) => {
			const oldDomain = queryClient.getQueryData( domainQuery( domainName ).queryKey );
			queryClient.setQueryData( domainQuery( domainName ).queryKey, {
				...oldDomain,
				private_domain: enable_privacy,
			} as Domain );
			queryClient.invalidateQueries( domainQuery( domainName ) );
		},
	} );

export const domainPrivacyDiscloseSaveMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( disclose: boolean ) =>
			disclose ? discloseDomainPrivacy( domainName ) : redactDomainPrivacy( domainName ),
		onSuccess: ( _, disclose: boolean ) => {
			const oldDomain = queryClient.getQueryData( domainQuery( domainName ).queryKey );
			queryClient.setQueryData( domainQuery( domainName ).queryKey, {
				...oldDomain,
				contact_info_disclosed: disclose,
			} as Domain );
			queryClient.invalidateQueries( domainQuery( domainName ) );
		},
	} );
