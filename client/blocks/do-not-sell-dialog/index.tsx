import { DoNotSellDialog } from '@automattic/privacy-toolset';
import { useDoNotSellContent } from './use-do-not-sell-content';
import { usePreventScroll } from './use-prevent-scroll';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onToggleActive: ( isActive: boolean ) => void;
	isActive: boolean;
};

const DoNotSellDialogContainer = ( { isOpen, ...props }: Props ) => {
	usePreventScroll( isOpen );
	const content = useDoNotSellContent();
	return (
		<DoNotSellDialog
			isOpen={ isOpen }
			content={ content }
			modalProps={ {
				bodyOpenClassName: null,
			} }
			{ ...props }
		/>
	);
};

export default DoNotSellDialogContainer;
