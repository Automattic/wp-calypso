import AddNewSiteA4AMenuItems from 'calypso/components/add-new-site/menu-items/a4a';
import AddNewSitesA4AModals from 'calypso/components/add-new-site/modals/a4a';
import AddNewSitePopover from 'calypso/components/add-new-site/popover';
import type { AddNewSiteContentProps } from 'calypso/components/add-new-site/types';

const AddNewSiteA4A = ( { isMenuVisible, setMenuVisible, toggleMenu }: AddNewSiteContentProps ) => {
	return (
		<>
			<div>
				<AddNewSitePopover isMenuVisible={ isMenuVisible } toggleMenu={ toggleMenu }>
					<AddNewSiteA4AMenuItems setMenuVisible={ setMenuVisible } />
				</AddNewSitePopover>
			</div>
			<AddNewSitesA4AModals />
		</>
	);
};

export default AddNewSiteA4A;
