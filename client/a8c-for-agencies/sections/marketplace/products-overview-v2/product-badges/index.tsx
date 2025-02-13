import CoreBadge from 'calypso/components/core/badge';
import { useProductCategories } from '../../hooks/use-product-categories';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

interface Props {
	product: APIProductFamilyProduct;
}

export default function ProductBadges( { product }: Props ) {
	const badges = useProductCategories( product );

	return (
		<div className="product-badges">
			{ badges.map( ( badge: string ) => (
				<CoreBadge key={ badge }>{ badge }</CoreBadge>
			) ) }
		</div>
	);
}
