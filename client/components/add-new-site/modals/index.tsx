import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import AddNewSitesA4AModals from './a4a';

const AddNewSiteModals = () => {
	if ( isA8CForAgencies() ) {
		return <AddNewSitesA4AModals />;
	}
	return null;
};

export default AddNewSiteModals;
