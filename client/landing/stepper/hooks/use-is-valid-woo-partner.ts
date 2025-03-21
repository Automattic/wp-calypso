import { OnboardSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useMemo } from 'react';
import { ONBOARD_STORE } from '../stores';

const VALID_WOO_PARTNERS = [ 'square', 'paypal', 'stripe' ];

export const useIsValidWooPartner = () => {
	const { partnerBundle } = useSelect(
		( select: ( arg: string ) => OnboardSelect ) => ( {
			partnerBundle: select( ONBOARD_STORE ).getPartnerBundle(),
		} ),
		[]
	);
	return useMemo( () => {
		if ( partnerBundle && VALID_WOO_PARTNERS.includes( partnerBundle ) ) {
			return true;
		}
		return false;
	}, [ partnerBundle ] );
};
