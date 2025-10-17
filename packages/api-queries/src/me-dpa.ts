import { requestDpa } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

export const requestDpaMutation = () =>
	mutationOptions( {
		mutationFn: requestDpa,
	} );
