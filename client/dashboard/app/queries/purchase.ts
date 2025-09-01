import { mutationOptions } from '@tanstack/react-query';
import { removePurchase } from '../../data/purchase';

export const removePurchaseMutation = () =>
	mutationOptions( {
		mutationFn: removePurchase,
	} );
