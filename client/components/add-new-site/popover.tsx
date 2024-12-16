import { Popover } from '@automattic/components';
import clsx from 'clsx';
import React from 'react';

type Props = {
	isMenuVisible: boolean;
	toggleMenu: () => void;
	// devSitesEnabled: boolean;
	popoverMenuContext: React.RefObject< HTMLButtonElement >;
	children: React.ReactNode;
};

const AddNewSitePopover: React.FC< Props > = ( {
	isMenuVisible,
	toggleMenu,
	// devSitesEnabled,
	popoverMenuContext,
	children,
} ) => {
	return (
		<Popover
			className={ clsx( 'add-new-site__popover', {
				// 'dev-sites-enabled': devSitesEnabled,
			} ) }
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
