import { DoNotSellDialog } from '@automattic/privacy-toolset';
import { useDoNotSellContent } from './use-do-not-sell-content';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onToggleActive: ( isActive: boolean ) => void;
	isActive: boolean;
};

const DoNotSellDialogContainer = ( { isOpen, ...props }: Props ) => {
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
