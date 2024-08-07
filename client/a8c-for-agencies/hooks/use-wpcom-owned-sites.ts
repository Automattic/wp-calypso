import { useEffect, useState } from 'react';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { License } from 'calypso/state/partner-portal/types';
import useFetchLicenses from '../data/purchases/use-fetch-licenses';
import useProductAndPlans from '../sections/marketplace/hooks/use-product-and-plans';
import { getWPCOMCreatorPlan } from '../sections/marketplace/lib/hosting';

export default function useWpcomOwnedSites() {
	// We will have to loop to all License pages to get all licenses and get correct calculation.
	const [ currentPage, setCurrentPage ] = useState( 1 );
	const [ licenses, setLicenses ] = useState< License[] >( [] );
	const [ totalLicenses, setTotalLicenses ] = useState( 0 );
	const [ isReady, setIsReady ] = useState( false );

	const { wpcomPlans } = useProductAndPlans( {} );

	const creatorPlan = getWPCOMCreatorPlan( wpcomPlans );

	const { data } = useFetchLicenses(
		LicenseFilter.NotRevoked,
		'',
		LicenseSortField.IssuedAt,
		LicenseSortDirection.Descending,
		currentPage,
		100
	);

	useEffect( () => {
		if ( data ) {
			setLicenses( ( prevLicenses ) => [ ...prevLicenses, ...data.items ] );
			setTotalLicenses( data.total );
		}
	}, [ data ] );

	useEffect( () => {
		if ( licenses.length < totalLicenses ) {
			setCurrentPage( ( prevPage ) => prevPage + 1 );
		} else {
			// if we have all licenses, then we are ready to calculate the count
			setIsReady( true );
		}
	}, [ licenses.length, totalLicenses ] );

	return {
		count: isReady
			? licenses.filter(
					( license ) => license.productId === creatorPlan?.product_id && ! license.referral // We make sure we do not count referrals
			  ).length
			: 0,
		isReady,
	};
}
