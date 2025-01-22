import { Popover } from '@automattic/components';
import clsx from 'clsx';
import React from 'react';

type Props = {
	isMenuVisible: boolean;
	toggleMenu: () => void;
	popoverMenuContext: React.RefObject< HTMLButtonElement >;
	children: React.ReactNode;
	popoverClassName?: string;
};

const AddNewSitePopover: React.FC< Props > = ( {
	isMenuVisible,
	toggleMenu,
	popoverMenuContext,
	children,
	popoverClassName,
} ) => {
	return (
		<Popover
			className={ clsx( 'add-new-site__popover', popoverClassName ) }
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
