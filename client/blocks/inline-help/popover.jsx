import { Popover } from '@automattic/components';
import InlineHelpPopoverContent from './popover-content';

export default function InlineHelpPopover( { context, onClose, showVideoResult } ) {
	return (
		<Popover
			isVisible
			onClose={ onClose }
			position="top left"
			context={ context }
			className="inline-help__popover"
		>
			<InlineHelpPopoverContent onClose={ onClose } showVideoResult={ showVideoResult } />
		</Popover>
	);
}
