import { useMemo } from 'react';
import { useQuery } from './use-query';

const VALID_WOO_PARTNERS = [ 'square', 'paypal', 'stripe' ];

export const useIsValidWooPartner = () => {
	const query = useQuery();
	const queryParams = Object.fromEntries( query );
	const partnerBundle = queryParams.partnerBundle;
	return useMemo( () => {
		if ( partnerBundle && VALID_WOO_PARTNERS.includes( partnerBundle ) ) {
			return true;
		}
		return false;
	}, [ partnerBundle ] );
};
