import page from '@automattic/calypso-router';
import { type MinimalRequestCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Banner } from 'calypso/components/banner/index';
import wpcom from 'calypso/lib/wp';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

interface SpecialOffersResponse {
	offer: null | {
		banner_text: string;
		cta_text: string;
		products: MinimalRequestCartProduct[];
	};
}

export default function PlansSpecialOfferBanner() {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const cart = useShoppingCart( selectedSiteId! );

	const { data } = useQuery< SpecialOffersResponse >( {
		queryKey: [ 'special-offers', selectedSiteId ],
		queryFn: async () => {
			return wpcom.req.get( {
				path: `/sites/${ selectedSiteId }/special-offers`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: Boolean( selectedSiteId ),
		staleTime: 60 * 60 * 1000,
		meta: {
			persist: false,
		},
	} );

	if ( ! selectedSiteId || ! data?.offer ) {
		return null;
	}

	async function handleAddCart() {
		if ( data?.offer ) {
			await cart.addProductsToCart( data?.offer?.products );
			page( `/checkout/${ selectedSiteSlug }` );
		}
	}

	return (
		<div style={ { paddingLeft: 32 } }>
			<Banner
				title={ data.offer.banner_text }
				primaryButton
				callToAction={ data.offer.cta_text }
				onClick={ handleAddCart }
			/>
		</div>
	);
}
