import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import A4ACarousel from 'calypso/a8c-for-agencies/components/a4a-carousel';

import './style.scss';

export default function ProductCategoryMenu() {
	const translate = useTranslate();

	// We will replace this with the actual categories on a separate PR
	const categories = [
		{ label: 'Jetpack', value: 'jetpack' },
		{ label: 'Woo', value: 'woocommerce' },
		{ label: 'Security', value: 'security' },
		{ label: 'Management', value: 'management' },
		{ label: 'Conversion', value: 'conversion' },
		{ label: 'Marketing', value: 'marketing' },
		{ label: 'Social', value: 'social' },
		{ label: 'Payments', value: 'payments' },
	];

	const isMobile = useBreakpoint( '<660px' );

	return (
		<div className="product-category-menu">
			<h1 className="product-category-menu-title">
				{ isMobile ? translate( 'Shop by category' ) : translate( 'Shop products by category' ) }
			</h1>
			<A4ACarousel className="product-category-menu-items">
				{ categories.map( ( category ) => (
					<div className="product-category-menu-item" key={ category.value }>
						{ category.label }
					</div>
				) ) }
			</A4ACarousel>
		</div>
	);
}
