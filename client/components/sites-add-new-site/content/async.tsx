import { Spinner } from '@wordpress/components';
import AsyncLoad from 'calypso/components/async-load';

export const AsyncContent = () => {
	return (
		<AsyncLoad
			require="calypso/components/sites-add-new-site/content"
			placeholder={ <Spinner /> }
		/>
	);
};
