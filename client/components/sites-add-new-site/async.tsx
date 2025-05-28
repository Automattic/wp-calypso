import { Spinner } from '@wordpress/components';
import AsyncLoad from 'calypso/components/async-load';
import type { AddNewSiteProps } from '../../dashboard/sites/add-new-site/types';

export const AsyncContent = ( props: AddNewSiteProps ) => {
	return (
		<AsyncLoad
			require="calypso/dashboard/sites/add-new-site"
			placeholder={ <Spinner /> }
			{ ...props }
		/>
	);
};
