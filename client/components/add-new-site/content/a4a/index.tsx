import AddNewSiteA4AMenuItems from '../../menu-items/a4a';
import AddNewSitesA4AModals from '../../modals/a4a';
import AddNewSitePopover from '../../popover';
import type { AddNewSiteContentProps } from '../../types';

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
