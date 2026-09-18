import { ShelfUpsertModal } from 'calypso/reader/shelves/customize-modal';
import type { ReadShelf } from '@automattic/api-core';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onCreated?: ( shelf: ReadShelf ) => void;
}

export function CreateShelfModal( { isOpen, onClose, onCreated }: Props ) {
	return (
		<ShelfUpsertModal isOpen={ isOpen } mode="create" onClose={ onClose } onCreated={ onCreated } />
	);
}
