import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
	fetchDomainWhois,
	fetchDomainWhoisValidate,
	updateDomainWhois,
	type DomainContactDetails,
} from '../../data/domain-whois';
import { queryClient } from '../query-client';

export const domainWhoisQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'whois' ],
		queryFn: () => fetchDomainWhois( domainName ),
	} );

export const domainWhoisValidateQuery = (
	domainName: string,
	domainContactDetails: DomainContactDetails
) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'whois', 'validate' ],
		queryFn: () => fetchDomainWhoisValidate( domainName, domainContactDetails ),
	} );

export const domainWhoisMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( {
			formData,
			transferLock,
		}: {
			formData: DomainContactDetails;
			transferLock: boolean;
		} ) => updateDomainWhois( domainName, formData, transferLock ),
		onSuccess: () => queryClient.invalidateQueries( domainWhoisQuery( domainName ) ),
	} );
