import { useRouter, useSearch } from '@tanstack/react-router';
import { removeSearchParams } from '../../app/hooks/use-consume-search-params';
import {
	DIFM_OFFER_PURCHASED_SEARCH,
	DifmOfferThankYouModal,
} from '../../components/difm-offer-modal';

export interface DifmOfferSearch {
	// `open` comes from another surface's deep link. See deep-link.tsx.
	difmOffer?: typeof DIFM_OFFER_PURCHASED_SEARCH.difmOffer | 'open';
	source?: string;
}

/**
 * Checkout returns here with a search param after a purchase through the DIFM offer.
 */
export default function DifmOfferThankYou() {
	const router = useRouter();
	const { difmOffer }: DifmOfferSearch = useSearch( { strict: false } );

	if ( difmOffer !== DIFM_OFFER_PURCHASED_SEARCH.difmOffer ) {
		return null;
	}

	const handleClose = () => removeSearchParams( router, [ 'difmOffer' ] );

	return <DifmOfferThankYouModal onClose={ handleClose } />;
}
