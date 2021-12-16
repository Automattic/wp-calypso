import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { errorNotice } from 'calypso/state/notices/actions';
import { getPurchasesError } from 'calypso/state/purchases/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function SeoSettings() {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const purchasesError = useSelector( getPurchasesError );

	useEffect( () => {
		if ( purchasesError ) {
			dispatch( errorNotice( purchasesError ) );
		}
	}, [ dispatch, purchasesError ] );

	return (
		<>
			<QuerySitePurchases siteId={ siteId } />
			<AsyncLoad require="calypso/my-sites/site-settings/seo-settings/form" placeholder={ null } />
		</>
	);
}

export default SeoSettings;
