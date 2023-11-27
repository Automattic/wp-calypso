import { useQuery } from '@tanstack/react-query';
import { Banner } from 'calypso/components/banner/index';
import wpcom from 'calypso/lib/wp';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

interface SpecialOffersResponse {
	offer: null | {
		banner_text: string;
		cta_text: string;
		products: MinimalRequestCartProduct[];
	};
}

interface PlansSpecialOfferBannerProps {
	// `null` means check for offers valid for newly created sites
	blogId: number | null;
	className?: string;
	onClick?: ( products: MinimalRequestCartProduct[] ) => void;
}

export default function PlansSpecialOfferBanner( {
	blogId,
	className,
	onClick,
}: PlansSpecialOfferBannerProps ) {
	const { data } = useQuery< SpecialOffersResponse >( {
		queryKey: [ 'special-offers', blogId ],
		queryFn: async () => {
			const params = blogId ? { blog_id: blogId } : {};
			return wpcom.req.get(
				{
					path: `/me/special-offers`,
					apiNamespace: 'wpcom/v2',
				},
				params
			);
		},
		staleTime: 60 * 60 * 1000,
		meta: {
			persist: false,
		},
	} );

	if ( ! data?.offer ) {
		return null;
	}

	async function handleAddCart() {
		if ( data?.offer ) {
			onClick?.( data?.offer.products );
		}
	}

	return (
		<div className={ className }>
			<Banner
				title={ data.offer.banner_text }
				primaryButton
				callToAction={ data.offer.cta_text }
				onClick={ handleAddCart }
			/>
		</div>
	);
}
