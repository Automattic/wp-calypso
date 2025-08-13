import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
	fetchDomainWhois,
	fetchDomainWhoisValidate,
	updateDomainWhois,
} from '../../data/domain-whois';
import { queryClient } from '../query-client';
import type { DomainContactDetails } from '../../domains/contact-details/types';

export const domainWhoisQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'whois' ],
		queryFn: () => fetchDomainWhois( domainName ),
	} );

export const domainWhoisValidateQuery = ( domainName: string, contactInformation: any ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'whois', 'validate' ],
		queryFn: () => fetchDomainWhoisValidate( domainName, contactInformation ),
	} );

export const updateDomainWhoisMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( {
			formData,
			transferLock,
		}: {
			formData: DomainContactDetails;
			transferLock: boolean;
		} ) => updateDomainWhois( domainName, formData, transferLock ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'domains', domainName, 'whois' ] } );
		},
	} );
