import { useBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import A4ACarousel from 'calypso/a8c-for-agencies/components/a4a-carousel';
import { PRODUCT_FILTER_KEY_CATEGORIES } from '../../constants';
import useProductFilterOptions from '../../products-overview/product-filter/hooks/use-product-filter-options';

import './style.scss';

type Prop = {
	onSelect: ( category: string ) => void;
};

export default function ProductCategoryMenu( { onSelect }: Prop ) {
	const translate = useTranslate();

	const { [ PRODUCT_FILTER_KEY_CATEGORIES ]: categories } = useProductFilterOptions();

	const menuItems = categories.map( ( category ) => ( {
		label: category.shortLabel ?? category.label,
		value: category.key,
		icon: category.icon,
		image: category.image,
	} ) );

	const isMobile = useBreakpoint( '<660px' );

	return (
		<div className="product-category-menu">
			<h1 className="product-category-menu-title">
				{ isMobile ? translate( 'Shop by category' ) : translate( 'Shop products by category' ) }
			</h1>
			<A4ACarousel className="product-category-menu-items">
				{ menuItems.map( ( category ) => (
					<Button
						className="product-category-menu-item"
						key={ category.value }
						onClick={ () => onSelect( category.value ) }
					>
						{ category.image ?? (
							<>
								{ category.icon && <Icon icon={ category.icon } /> }
								{ category.label }
							</>
						) }
					</Button>
				) ) }
			</A4ACarousel>
		</div>
	);
}
