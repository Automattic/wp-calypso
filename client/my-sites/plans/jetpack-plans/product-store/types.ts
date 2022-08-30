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

export type ProductsListProps = ProductStoreBaseProps & Omit< ProductStoreProps, 'urlQueryArgs' >;

export type BundlesListProps = ProductsListProps;

export interface ItemsListProps extends ProductsListProps {
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

export type CreateCheckoutURLProps = ProductStoreBaseProps & {
	createCheckoutURL?: PurchaseURLCallback;
	duration: Duration;
	onClickPurchase?: PurchaseCallback;
};

export type ItemPriceProps = ProductStoreBaseProps &
	HeroImageProps & {
		isOwned?: boolean;
	};

export type FeaturedItemCardProps = ItemPriceProps & {
	checkoutURL?: string;
	hero: React.ReactNode;
	item: SelectorProduct;
	onClickMore: VoidFunction;
	onClickPurchase?: VoidFunction;
};
