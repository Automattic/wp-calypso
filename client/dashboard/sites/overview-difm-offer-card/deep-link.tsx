import { useState } from 'react';
import { useAuth } from '../../app/auth';
import { useConsumeSearchParams } from '../../app/hooks/use-consume-search-params';
import { useLocale } from '../../app/locale';
import DifmOfferModal from '../../components/difm-offer-modal';
import { useDifmOffer } from '../../utils/difm-offer';
import type { DifmOfferSource, Site } from '@automattic/api-core';

const DIFM_OFFER_OPEN = 'open';
const DEEP_LINK_PARAMS = [ 'difmOffer', 'source' ] as const;

// Surfaces outside the site overview that link here to open the offer.
const DEEP_LINK_SOURCES: DifmOfferSource[] = [ 'site-setup' ];

function getDeepLinkSource( source: string | undefined ): DifmOfferSource {
	const deepLinkSource = DEEP_LINK_SOURCES.find( ( knownSource ) => knownSource === source );
	return deepLinkSource ?? 'site-overview';
}

// Opens even if the user dismissed the overview card, because the click came from another surface.
export default function DifmOfferDeepLink( { site }: { site: Site } ) {
	const localeSlug = useLocale();
	const { user } = useAuth();
	const { isLoading, variation } = useDifmOffer( {
		planSlug: site.plan?.product_slug,
		siteCreatedAt: site.options?.created_at,
		localeSlug,
		isA4ADevSite: site.is_a4a_dev_site,
	} );
	const [ modalSource, setModalSource ] = useState< DifmOfferSource | null >( null );

	useConsumeSearchParams( DEEP_LINK_PARAMS, {
		when: ( params ) => params.difmOffer === DIFM_OFFER_OPEN && ! isLoading,
		onConsume: ( { source } ) => {
			if ( variation !== 'control' ) {
				setModalSource( getDeepLinkSource( source ) );
			}
		},
	} );

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
