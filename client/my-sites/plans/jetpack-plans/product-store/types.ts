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
		clickMoreHandlerFactory: ( item: SelectorProduct ) => VoidFunction | undefined;
	};

export type BundlesListProps = ProductsListProps;

export type itemToDisplayProps = Omit< ProductsListProps, 'clickMoreHandlerFactory' >;

export interface ItemsListProps extends itemToDisplayProps {
	currentView: ViewType;
}

export type MostPopularProps = {
	className?: string;
	heading: string;
	items: React.ReactNode;
};

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
	};

export type FeaturedItemCardProps = ItemPriceProps & {
	checkoutURL?: string;
	ctaAsPrimary?: boolean;
	ctaLabel: React.ReactNode;
	hero: React.ReactNode;
	isCtaDisabled?: boolean;
	item: SelectorProduct;
	onClickMore?: VoidFunction;
	onClickPurchase?: VoidFunction;
};

export type SimpleProductCardProps = Omit< FeaturedItemCardProps, 'hero' >;
