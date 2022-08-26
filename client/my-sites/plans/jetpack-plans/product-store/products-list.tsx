import { useTranslate } from 'i18n-calypso';
import { useProductsToDisplay } from './hooks/use-products-to-display';
import { MostPopular } from './most-popular';
import type { ProductsListProps } from './types';

export const ProductsList: React.FC< ProductsListProps > = ( { duration, siteId } ) => {
	const [ popularItems, otherItems ] = useProductsToDisplay( { duration, siteId } );
	const translate = useTranslate();

	const mostPopularItems = popularItems.map( ( item ) => {
		// TODO relace this with popular product card
		return <div key={ item.productSlug }>{ item.displayName }</div>;
	} );

	return (
		<div className="jetpack-product-store__products-list">
			<MostPopular heading={ translate( 'Most popular products' ) } items={ mostPopularItems } />

			<div className="jetpack-product-store__products-list-all">
				<h3>{ translate( 'All products' ) }</h3>
				<ul>
					{ otherItems.map( ( item ) => {
						// TODO relace this with product card
						return <li key={ item.productSlug }>{ item.displayName }</li>;
					} ) }
				</ul>
			</div>
		</div>
	);
};
