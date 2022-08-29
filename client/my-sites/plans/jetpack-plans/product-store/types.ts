import { QueryArgs, Duration } from '../types';

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
	urlQueryArgs: ProductStoreQueryArgs;
}

export type JetpackFreeProps = Pick< ProductStoreProps, 'urlQueryArgs' > & ProductStoreBaseProps;

export type ProductSlugsProps = Pick< ProductStoreProps, 'duration' > & ProductStoreBaseProps;

export interface ViewFilterProps {
	currentView: ViewType;
	setCurrentView: ( currentView: ViewType ) => void;
	shouldUpdateUrl: boolean;
}

export type ProductsListProps = ProductStoreBaseProps & Pick< ProductStoreProps, 'duration' >;

export type BundlesListProps = ProductsListProps;

export interface ItemsListProps extends ProductsListProps {
	currentView: ViewType;
}

export type MostPopularProps = {
	className?: string;
	heading: string;
	items: React.ReactNode;
};
