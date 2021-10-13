import { omit } from 'lodash';
import PopoverMenu from 'calypso/components/popover-menu';
import ReaderPopover from 'calypso/reader/components/reader-popover';

const ReaderPopoverMenu = ( props ) => {
	const popoverProps = omit( props, 'popoverComponent' );
	return (
		<PopoverMenu
			className="reader-popover__menu"
			popoverComponent={ ReaderPopover }
			{ ...popoverProps }
		>
			{ props.children }
		</PopoverMenu>
	);
};

export default ReaderPopoverMenu;
