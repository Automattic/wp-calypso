import {
	validateSiteAddress,
	changeSiteAddress,
	type ValidateSiteAddressData,
	type ChangeSiteAddressData,
} from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { domainsQuery } from './domains';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';

export const validateSiteAddressChangeMutation = () =>
	mutationOptions( {
		mutationFn: ( data: ValidateSiteAddressData ) => validateSiteAddress( data ),
	} );

export const changeSiteAddressChangeMutation = () =>
	mutationOptions( {
		mutationFn: ( data: ChangeSiteAddressData ) => changeSiteAddress( data ),
		onSuccess: ( data, { siteId } ) => {
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			queryClient.invalidateQueries( domainsQuery() );
		},
	} );
