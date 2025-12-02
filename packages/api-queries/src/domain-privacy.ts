import {
	disableDomainPrivacy,
	discloseDomainPrivacy,
	enableDomainPrivacy,
	redactDomainPrivacy,
} from '@automattic/api-core';
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

export const domainPrivacyDiscloseMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: () => discloseDomainPrivacy( domainName ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domainName ) );
		},
	} );

export const domainPrivacyRedactMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: () => redactDomainPrivacy( domainName ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domainName ) );
		},
	} );
