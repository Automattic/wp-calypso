import { BasePageProps, Duration } from '../types';

export interface ProductStoreBaseProps {
	siteId: number | null;
}

export interface ProductStoreProps extends Pick< BasePageProps, 'urlQueryArgs' > {
	/**
	 * Whether to show the licence activation dialog
	 */
	enableUserLicensesDialog?: boolean;
	duration: Duration;
}

export type JetpackFreeProps = Pick< ProductStoreProps, 'urlQueryArgs' > & ProductStoreBaseProps;

export type ProductSlugsProps = Pick< ProductStoreProps, 'duration' > & ProductStoreBaseProps;

export type ViewType = 'products' | 'bundles';

export interface ViewFilterProps {
	currentView: ViewType;
	setCurrentView: ( currentView: ViewType ) => void;
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
