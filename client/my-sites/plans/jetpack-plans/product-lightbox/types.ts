import React from 'react';
import { SelectorProduct } from '../types';

export type PricingBreakdownProps = {
	product: SelectorProduct;
	siteId: number | null;
	includedProductSlugs: ReadonlyArray< string >;
	showBreakdownHeading?: boolean;
};

export type PricingBreakdownItem = {
	name: React.ReactNode;
	slug: string;
	originalPrice: number;
	renderedPrice: React.ReactNode;
};
