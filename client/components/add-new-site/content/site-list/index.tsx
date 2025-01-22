import AddNewSiteSiteListMenuItems from 'calypso/components/add-new-site/menu-items/site-list';
import AddNewSitePopover from 'calypso/components/add-new-site/popover';
import type { AddNewSiteContentProps } from 'calypso/components/add-new-site/types';

const AddNewSiteSiteList = ( { isMenuVisible, toggleMenu }: AddNewSiteContentProps ) => {
	return (
		<AddNewSitePopover isMenuVisible={ isMenuVisible } toggleMenu={ toggleMenu } showAnchor>
			<AddNewSiteSiteListMenuItems />
		</AddNewSitePopover>
	);
};

export default AddNewSiteSiteList;
