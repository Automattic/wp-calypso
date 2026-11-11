import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../app/auth';
import { useLocale } from '../../app/locale';
import DifmOfferModal from '../../components/difm-offer-modal';
import { useDifmOffer } from '../../utils/difm-offer';
import type { DifmOfferSearch } from './thank-you';
import type { DifmOfferSource, Site } from '@automattic/api-core';

const DIFM_OFFER_OPEN = 'open';

// Surfaces outside the site overview that link here to open the offer.
const DEEP_LINK_SOURCES: DifmOfferSource[] = [ 'site-setup' ];

function getDeepLinkSource( source: string | undefined ): DifmOfferSource {
	const deepLinkSource = DEEP_LINK_SOURCES.find( ( knownSource ) => knownSource === source );
	return deepLinkSource ?? 'site-overview';
}

// Opens even if the user dismissed the overview card, because the click came from another surface.
export default function DifmOfferDeepLink( { site }: { site: Site } ) {
	const navigate = useNavigate();
	const localeSlug = useLocale();
	const { user } = useAuth();
	const { difmOffer, source }: DifmOfferSearch = useSearch( { strict: false } );
	const isRequested = difmOffer === DIFM_OFFER_OPEN;
	const { isLoading, variation } = useDifmOffer( {
		planSlug: site.plan?.product_slug,
		siteCreatedAt: site.options?.created_at,
		localeSlug,
		isA4ADevSite: site.is_a4a_dev_site,
	} );
	const [ modalSource, setModalSource ] = useState< DifmOfferSource | null >( null );

	useEffect( () => {
		if ( ! isRequested || isLoading ) {
			return;
		}

		if ( variation !== 'control' ) {
			setModalSource( getDeepLinkSource( source ) );
		}

		navigate( {
			to: '.',
			search: ( prev: Record< string, unknown > ) => ( {
				...prev,
				difmOffer: undefined,
				source: undefined,
			} ),
			replace: true,
		} );
	}, [ isRequested, isLoading, variation, source, navigate ] );

	if ( ! modalSource || variation === 'control' ) {
		return null;
	}

	return (
		<DifmOfferModal
			site={ site }
			userEmail={ user.email }
			variation={ variation }
			source={ modalSource }
			onClose={ () => setModalSource( null ) }
		/>
	);
}
