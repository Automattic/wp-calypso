import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isWPCOMEnvironment from 'calypso/lib/wpcom/is-wpcom-environment';
import AddNewSiteA4AMenuItems from './a4a';
import AddNewSiteWPCOMMenuItems from './wpcom';
import type { AddNewSiteMenuItemsProps } from '../types';

const AddNewSiteMenuItems = ( props: AddNewSiteMenuItemsProps ) => {
	if ( isA8CForAgencies() ) {
		return <AddNewSiteA4AMenuItems { ...props } />;
	}
	if ( isWPCOMEnvironment() ) {
		return <AddNewSiteWPCOMMenuItems { ...props } />;
	}
	return null;
};

export default AddNewSiteMenuItems;
