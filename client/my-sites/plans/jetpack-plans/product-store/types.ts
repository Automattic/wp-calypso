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

export type ProductSlugProps = Pick< ProductStoreProps, 'duration' > & ProductStoreBaseProps;
