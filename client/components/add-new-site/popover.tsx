import { Popover } from '@wordpress/components';

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
			// className={ clsx( 'add-new-site__popover', popoverClassName ) }
			// context={ popoverMenuContext?.current }
			isVisible={ isMenuVisible }
			onClose={ toggleMenu }
			noArrow={ false }
			offset={ 10 }
			closeOnEsc
			autoPosition={ false }
			placement="bottom-end"
		>
			<div className="add-new-site__popover-content">{ children }</div>
		</Popover>
	);
};

export default AddNewSitePopover;
