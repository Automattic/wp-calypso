import { useNavigate, useSearch } from '@tanstack/react-router';
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
	const navigate = useNavigate();
	const { difmOffer }: DifmOfferSearch = useSearch( { strict: false } );

	if ( difmOffer !== DIFM_OFFER_PURCHASED_SEARCH.difmOffer ) {
		return null;
	}

	const handleClose = () =>
		navigate( {
			to: '.',
			search: ( prev: Record< string, unknown > ) => ( { ...prev, difmOffer: undefined } ),
			replace: true,
		} );

	return <DifmOfferThankYouModal onClose={ handleClose } />;
}
