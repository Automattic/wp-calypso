import { removePurchase } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

export const removePurchaseMutation = () =>
	mutationOptions( {
		mutationFn: removePurchase,
	} );
