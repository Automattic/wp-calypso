import { queryOptions } from '@tanstack/react-query';
import { fetchDomainWhois, fetchDomainWhoisValidate } from '../../data/domain-whois';

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
