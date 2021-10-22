import { useQuery, UseQueryResult } from 'react-query';
import wpcom from 'calypso/lib/wp';

export type UserLicenseApi = {
	license_key: string;
	product: string;
	product_id: number;
	subscription_id: number;
};

export type UserLicense = {
	licenseKey: string;
	product: string;
	productId: number;
	subscriptionId: number;
};

function selectUserLicenseApiData( licenses: UserLicenseApi[] ): UserLicense[] {
	return licenses.map( ( license ) => ( {
		licenseKey: license.license_key,
		product: license.product,
		productId: license.product_id,
		subscriptionId: license.subscription_id,
	} ) );
}

const useUserLicenseByReceiptQuery = ( receiptId: number ): UseQueryResult< UserLicense[] > => {
	const queryKey = [ 'user-license', receiptId ];
	return useQuery< UserLicenseApi[], unknown, UserLicense[] >(
		queryKey,
		async () =>
			wpcom.req.get( {
				path: `/jetpack-licensing/receipt/${ receiptId }`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			select: selectUserLicenseApiData,
		}
	);
};

export default useUserLicenseByReceiptQuery;
