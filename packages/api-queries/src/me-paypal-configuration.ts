import { fetchPayPalConfiguration } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const payPalConfigurationQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'paypal-configuration' ],
		queryFn: fetchPayPalConfiguration,
	} );
