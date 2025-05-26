import { Spinner } from '@wordpress/components';
import AsyncLoad from 'calypso/components/async-load';
import type { AddNewSiteProps } from './types';

export const AsyncContent = ( props: AddNewSiteProps ) => {
	return (
		<AsyncLoad
			require="calypso/dashboard/sites/add-new-site"
			placeholder={ <Spinner /> }
			{ ...props }
		/>
	);
};
