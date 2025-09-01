import {
	fetchDomainWhois,
	validateDomainWhois,
	updateDomainWhois,
	type DomainContactDetails,
	type ContactValidationRequestContactInformation,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { camelToSnakeCase, mapRecordKeysRecursively } from '../../utils/domain';
import { queryClient } from '../query-client';

export const domainWhoisQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'whois' ],
		queryFn: () => fetchDomainWhois( domainName ),
	} );

export const domainWhoisValidateMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( domainContactDetails: DomainContactDetails ) => {
			const contactInformation = mapRecordKeysRecursively(
				domainContactDetails,
				camelToSnakeCase
			) as ContactValidationRequestContactInformation;
			return validateDomainWhois( domainName, contactInformation );
		},
	} );

export const domainWhoisMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( {
			domainContactDetails,
			transferLock,
		}: {
			domainContactDetails: DomainContactDetails;
			transferLock: boolean;
		} ) => updateDomainWhois( domainName, domainContactDetails, transferLock ),
		onSuccess: () => queryClient.invalidateQueries( domainWhoisQuery( domainName ) ),
	} );
