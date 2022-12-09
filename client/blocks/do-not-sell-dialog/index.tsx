import { DoNotSellDialog } from '@automattic/privacy-toolset';
import { useState } from 'react';
import { useDoNotSellContent } from './use-do-not-sell-content';
import { usePreventScroll } from './use-prevent-scroll';
import type { DoNotSellDialogProps } from '@uatomattic/privacy-toolset';

export const useDialogHelper = () => {
	const [ isDialogOpen, setIsDialogOpen ] = useState( false );

	const openDialog = () => {
		setIsDialogOpen( true );
	};
	const closeDialog = () => {
		setIsDialogOpen( false );
	};

	return { isDialogOpen, openDialog, closeDialog };
};

type Props = Omit< DoNotSellDialogProps, 'content' | 'modalProps' >;
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
