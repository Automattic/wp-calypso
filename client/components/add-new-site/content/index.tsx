import AsyncLoad from 'calypso/components/async-load';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import type { AddNewSiteContentProps } from 'calypso/components/add-new-site/types';

const loadA4a = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-add-new-site-content-a4a" */ './a4a'
	);

// Always ensure that we load env-specific content asychronously
const AddNewSiteContent = ( props: AddNewSiteContentProps ) => {
	if ( isA8CForAgencies() ) {
		return <AsyncLoad { ...props } require={ loadA4a } placeholder={ null } />;
	}
};

export default AddNewSiteContent;
