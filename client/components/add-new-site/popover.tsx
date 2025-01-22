import { Popover } from '@wordpress/components';

type Props = {
	isMenuVisible: boolean;
	showAnchor?: boolean;
	toggleMenu: () => void;
	children: React.ReactNode;
};

const AddNewSitePopover: React.FC< Props > = ( {
	isMenuVisible,
	toggleMenu,
	children,
	showAnchor = false,
} ) => {
	if ( ! isMenuVisible ) {
		return null;
	}

	return (
		<Popover
			isVisible={ isMenuVisible }
			onClose={ toggleMenu }
			noArrow={ ! showAnchor }
			offset={ 10 }
			placement="bottom-end"
		>
			<div className="add-new-site__popover-content">{ children }</div>
		</Popover>
	);
};

export default AddNewSitePopover;
