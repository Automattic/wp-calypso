import { mutationOptions } from '@tanstack/react-query';
import { requestDpa } from '../../data/me-dpa';

export const requestDpaMutation = () =>
	mutationOptions( {
		mutationFn: requestDpa,
	} );
