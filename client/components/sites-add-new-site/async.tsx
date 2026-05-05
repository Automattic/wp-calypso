import AddNewSite from '../../dashboard/sites/add-new-site';
import type { AddNewSiteProps } from '../../dashboard/sites/add-new-site/types';

export const AsyncContent = ( props: AddNewSiteProps ) => {
	return <AddNewSite { ...props } />;
};
