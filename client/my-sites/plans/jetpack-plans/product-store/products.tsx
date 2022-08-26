import { useTranslate } from 'i18n-calypso';
import { MostPopular } from './most-popular';
import { SeeAllFeatures } from './see-all-features';
import type { ProductProps } from './types';

const Products: React.FC< ProductProps > = ( { type } ) => {
	const translate = useTranslate();

	return (
		<div className="jetpack-product-store__products">
			{ type === 'products' && (
				<div>
					<MostPopular heading={ translate( 'Most popular products' ) } items={ <></> } />
				</div>
			) }
			{ type === 'bundles' && (
				<div>
					<MostPopular heading={ translate( 'Most popular bundles' ) } items={ <></> } />
					<SeeAllFeatures />
				</div>
			) }
		</div>
	);
};

export default Products;
