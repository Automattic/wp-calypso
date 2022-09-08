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
	createCheckoutURL?: PurchaseURLCallback;
	onClickPurchase?: PurchaseCallback;
	urlQueryArgs: ProductStoreQueryArgs;
	header: React.ReactNode;
}

export type JetpackFreeProps = Pick< ProductStoreProps, 'urlQueryArgs' > & ProductStoreBaseProps;

export type ProductSlugsProps = Pick< ProductStoreProps, 'duration' > & ProductStoreBaseProps;

export type productIconProps = {
	productSlug: string;
};

export interface ViewFilterProps {
	currentView: ViewType;
	setCurrentView: ( currentView: ViewType ) => void;
}

export type ProductsListProps = ProductStoreBaseProps &
	Omit< ProductStoreProps, 'urlQueryArgs' | 'header' > & {
		onClickMoreInfoFactory: ( item: SelectorProduct ) => VoidFunction;
	};

export type BundlesListProps = ProductsListProps;

export type ItemToDisplayProps = Omit< ProductsListProps, 'onClickMoreInfoFactory' >;

export interface ItemsListProps extends ItemToDisplayProps {
	currentView: ViewType;
}

export type MostPopularProps = UseStoreItemInfoProps & {
	className?: string;
	heading: string;
	items: Array< SelectorProduct >;
	onClickMoreInfoFactory: ( item: SelectorProduct ) => VoidFunction;
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

export type ItemPriceProps = ProductStoreBaseProps &
	HeroImageProps & {
		isOwned?: boolean;
		isIncludedInPlan?: boolean;
		isMultiSiteIncompatible?: boolean;
	};

export type FeaturedItemCardProps = {
	ctaAsPrimary?: boolean;
	ctaHref?: string;
	ctaLabel: React.ReactNode;
	description: React.ReactNode;
	hero: React.ReactNode;
	isCtaDisabled?: boolean;
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
};
