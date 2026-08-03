import {
	validateSiteAddress,
	changeSiteAddress,
	type ValidateSiteAddressData,
	type ChangeSiteAddressData,
} from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';

export const validateSiteAddressChangeMutation = () =>
	mutationOptions( {
		meta: { statId: 'site-address-validate' },
		mutationFn: ( data: ValidateSiteAddressData ) => validateSiteAddress( data ),
	} );

export const changeSiteAddressChangeMutation = () =>
	mutationOptions( {
		meta: { statId: 'site-address-change' },
		mutationFn: ( data: ChangeSiteAddressData ) => changeSiteAddress( data ),
		onSuccess: ( data, { siteId } ) => {
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			queryClient.invalidateQueries( { queryKey: [ 'domains' ] } );
		},
	} );
