import { Popover } from '@automattic/components';
import React from 'react';

type Props = {
	isMenuVisible: boolean;
	toggleMenu: () => void;
	popoverMenuContext: React.RefObject< HTMLButtonElement >;
	children: React.ReactNode;
};

const AddNewSitePopover: React.FC< Props > = ( {
	isMenuVisible,
	toggleMenu,
	popoverMenuContext,
	children,
} ) => {
	return (
		<Popover
			className="add-new-site__popover"
			context={ popoverMenuContext?.current }
			isVisible={ isMenuVisible }
			closeOnEsc
			onClose={ toggleMenu }
			autoPosition={ false }
			position="bottom left"
		>
			<div className="add-new-site__popover-content">{ children }</div>
		</Popover>
	);
};

export default AddNewSitePopover;
