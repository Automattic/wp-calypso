import AsyncLoad from 'calypso/components/async-load';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';

const AddNewSiteModals = () => {
	if ( isA8CForAgencies() ) {
		return <AsyncLoad require="calypso/components/add-new-site/modals/a4a" placeholder={ null } />;
	}
	return null;
};

export default AddNewSiteModals;
