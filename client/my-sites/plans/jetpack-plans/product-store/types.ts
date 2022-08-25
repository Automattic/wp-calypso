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

export type FilterType = 'products' | 'bundles';
export interface ProductFilterProps {
	filterType: FilterType;
	setFilterType: ( filterType: FilterType ) => void;
}

export interface ProductProps {
	type: FilterType;
}

export type MostPopularProps = {
	className?: string;
	heading: string;
	items: React.ReactNode;
};
