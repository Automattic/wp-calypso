import AddNewSiteA4AMenuItems from 'calypso/components/add-new-site/menu-items/a4a';
import AddNewSitesA4AModals from 'calypso/components/add-new-site/modals/a4a';
import AddNewSitePopover from 'calypso/components/add-new-site/popover';
import type { AddNewSiteContentProps } from 'calypso/components/add-new-site/types';

const AddNewSiteA4A = ( {
	isMenuVisible,
	popoverMenuContext,
	setMenuVisible,
	toggleMenu,
}: AddNewSiteContentProps ) => {
	return (
		<>
			<AddNewSitePopover
				isMenuVisible={ isMenuVisible }
				toggleMenu={ toggleMenu }
				popoverMenuContext={ popoverMenuContext }
			>
				<AddNewSiteA4AMenuItems setMenuVisible={ setMenuVisible } />
			</AddNewSitePopover>
			<AddNewSitesA4AModals />
		</>
	);
};

export default AddNewSiteA4A;
