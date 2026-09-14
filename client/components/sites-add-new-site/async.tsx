import { Spinner } from '@wordpress/components';
import AsyncLoad from 'calypso/components/async-load';
import type { AddNewSiteProps } from '../../dashboard/sites/add-new-site/types';

const loadAddNewSite = () =>
	import(
		/* webpackChunkName: "async-load-calypso-dashboard-sites-add-new-site" */ 'calypso/dashboard/sites/add-new-site'
	);

export const AsyncContent = ( props: AddNewSiteProps ) => {
	return <AsyncLoad require={ loadAddNewSite } placeholder={ <Spinner /> } { ...props } />;
};
