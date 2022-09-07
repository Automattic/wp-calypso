import { useStoreItemInfo } from './hooks/use-store-item-info';
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
	};

export type FeaturedItemCardProps = ItemPriceProps & {
	checkoutURL?: string;
	ctaAsPrimary?: boolean;
	ctaLabel: React.ReactNode;
	hero: React.ReactNode;
	isCtaDisabled?: boolean;
	item: SelectorProduct;
	hideMoreInfoLink?: boolean;
	onClickMore?: VoidFunction;
	onClickPurchase?: VoidFunction;
};

export type SimpleProductCardProps = Omit< FeaturedItemCardProps, 'hero' >;

export type MoreInfoLinkProps = Pick< FeaturedItemCardProps, 'item' | 'onClickMore' >;
