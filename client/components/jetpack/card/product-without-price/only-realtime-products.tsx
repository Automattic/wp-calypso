import { Button } from '@automattic/components';
import classnames from 'classnames';
import { useMemo } from 'react';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

export type OnlyRealtimeProductsProps = {
	fullWidth?: boolean;
	className?: string;
	productSlug: string;
	displayName: TranslateResult;
	description: TranslateResult;
	productFeatures?: TranslateResult[];
	buttonHref?: string;
	onButtonClick: React.MouseEventHandler;
	buttonLabel: TranslateResult;
};

const ProductWithoutPrice: React.FC< OnlyRealtimeProductsProps > = ( {
	className,
	productSlug,
	displayName,
	description,
	productFeatures,
	buttonHref,
	onButtonClick,
	buttonLabel,
} ) => {
	const featuresListItems = useMemo(
		() =>
			productFeatures?.map( ( text: TranslateResult, index: number ) => (
				<li key={ index }>{ text }</li>
			) ),
		[ productFeatures ]
	);

	return (
		<div
			className={ classnames( 'jetpack-product-card', 'product-without-price', className ) }
			data-e2e-product-slug={ productSlug }
		>
			<h3 className="product-without-price__title">{ displayName }</h3>
			<Button
				className="product-without-price__button"
				href={ buttonHref }
				onClick={ onButtonClick }
			>
				{ buttonLabel }
			</Button>
			<p className="product-without-price__subheadline">{ description }</p>
			{ productFeatures && (
				<ul className="product-without-price__features-list">{ featuresListItems }</ul>
			) }
		</div>
	);
};

export default ProductWithoutPrice;
