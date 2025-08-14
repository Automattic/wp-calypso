import { mutationOptions } from '@tanstack/react-query';
import {
	validateSiteAddress,
	changeSiteAddress,
	type ValidateSiteAddressData,
	type ChangeSiteAddressData,
} from '../../data/site-address-change';
import { queryClient } from '../query-client';
import { siteQueryFilter } from './site';
import { siteDomainsQuery } from './site-domains';

export const validateSiteAddressChangeMutation = () =>
	mutationOptions( {
		mutationFn: ( data: ValidateSiteAddressData ) => validateSiteAddress( data ),
	} );

export const changeSiteAddressChangeMutation = () =>
	mutationOptions( {
		mutationFn: ( data: ChangeSiteAddressData ) => changeSiteAddress( data ),
		onSuccess: ( data, { siteId } ) => {
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			queryClient.invalidateQueries( siteDomainsQuery( siteId ) );
		},
	} );
