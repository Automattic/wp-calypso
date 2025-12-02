import { fetchSMSCountryCodes } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const smsCountryCodesQuery = () =>
	queryOptions( {
		queryKey: [ 'meta', 'sms-country-codes' ],
		queryFn: fetchSMSCountryCodes,
	} );
