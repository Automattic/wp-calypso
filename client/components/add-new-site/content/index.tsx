import AsyncLoad from 'calypso/components/async-load';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import type { AddNewSiteContentProps } from 'calypso/components/add-new-site/types';

// Always ensure that we load env-specific content asychronously
const AddNewSiteContent = ( props: AddNewSiteContentProps ) => {
	if ( isA8CForAgencies() ) {
		return (
			<AsyncLoad
				{ ...props }
				require="calypso/components/add-new-site/content/a4a"
				placeholder={ null }
			/>
		);
	}
	return (
		<AsyncLoad
			{ ...props }
			require="calypso/components/add-new-site/content/site-list"
			placeholder={ null }
		/>
	);
};

export default AddNewSiteContent;
