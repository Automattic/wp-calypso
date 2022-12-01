import React from 'react';
import { useStoreItemInfo } from './hooks/use-store-item-info';
import type { PlanRecommendation } from '../plan-upgrade/types';
import type {
	QueryArgs,
	SelectorProduct,
	Duration,
	PurchaseCallback,
	PurchaseURLCallback,
} from '../types';

export type ViewType = 'products' | 'bundles';

export interface ProductStoreBaseProps {
	siteId: number | null;
}

export type ProductStoreQueryArgs = QueryArgs & {
	view?: ViewType;
};
export interface ProductStoreProps {
	/**
	 * Whether to show the licence activation dialog
	 */
	enableUserLicensesDialog?: boolean;
	duration: Duration;
	createCheckoutURL: PurchaseURLCallback;
	onClickPurchase: PurchaseCallback;
	planRecommendation?: PlanRecommendation;
	urlQueryArgs: ProductStoreQueryArgs;
	header: React.ReactNode;
}

export type JetpackFreeProps = Pick< ProductStoreProps, 'urlQueryArgs' > & ProductStoreBaseProps;

export type ProductSlugsProps = Pick< ProductStoreProps, 'duration' > & ProductStoreBaseProps;

export type productIconProps = {
	productSlug: string;
};

export type ProductsListProps = ProductStoreBaseProps & {
	onClickMoreInfoFactory: ( item: SelectorProduct ) => VoidFunction;
	duration: Duration;
};

export type BundlesListProps = ProductsListProps;

export type ItemToDisplayProps = {
	siteId: number | null;
	duration: Duration;
};

export interface ItemsListProps extends ItemToDisplayProps {
	currentView: ViewType;
}

export type MostPopularProps = {
	className?: string;
	heading: string;
	items: Array< SelectorProduct >;
	onClickMoreInfoFactory: ( item: SelectorProduct ) => VoidFunction;
	siteId: number | null;
};

export type AllItemsProps = MostPopularProps;

export type HeroImageProps = {
	item: SelectorProduct;
};

export type FeaturesListProps = HeroImageProps;

export type UseStoreItemInfoProps = ProductStoreBaseProps & {
	createCheckoutURL?: PurchaseURLCallback;
	duration: Duration;
	onClickPurchase?: PurchaseCallback;
};

export type StoreItemInfo = ReturnType< typeof useStoreItemInfo >;

export type ItemPriceProps = ProductStoreBaseProps &
	HeroImageProps & {
		isOwned?: boolean;
		isIncludedInPlan?: boolean;
		isMultiSiteIncompatible?: boolean;
	};

export type FeaturedItemCardProps = {
	amountSaved?: React.ReactNode;
	ctaAsPrimary?: boolean;
	ctaHref?: string;
	ctaLabel: React.ReactNode;
	description: React.ReactNode;
	hero: React.ReactNode;
	isCtaDisabled?: boolean;
	isCtaExternal?: boolean;
	onClickCta?: VoidFunction;
	price: React.ReactNode;
	title: React.ReactNode;
};

export type SimpleItemCardProps = Omit< FeaturedItemCardProps, 'hero' > & {
	icon?: React.ReactNode;
};

export type MoreInfoLinkProps = {
	item: SelectorProduct;
	onClick?: VoidFunction;
	isExternal?: boolean;
};

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

export type AmountSavedProps = ProductStoreBaseProps & {
	product: SelectorProduct;
	onClick: VoidFunction;
};
