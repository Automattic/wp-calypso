import { Button } from '@automattic/components';
import classnames from 'classnames';
import { FC, useMemo } from 'react';
import * as React from 'react';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

type OwnProps = {
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

const ProductWithoutPrice: FC< OwnProps > = ( {
	fullWidth,
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

	const ownClassName = fullWidth ? 'product-without-price--full-width' : 'product-without-price';

	return (
		<div
			className={ classnames( ownClassName, 'jetpack-product-card', className ) }
			data-e2e-product-slug={ productSlug }
		>
			<header className="product-without-price__header">
				<h3 className="product-without-price__title">{ displayName }</h3>
				<p className="product-without-price__subheadline">{ description }</p>
				<Button
					className="product-without-price__button"
					href={ buttonHref }
					onClick={ onButtonClick }
				>
					{ buttonLabel }
				</Button>
			</header>
			{ productFeatures && (
				<ul className="product-without-price__features-list">{ featuresListItems }</ul>
			) }
		</div>
	);
};

export default ProductWithoutPrice;
