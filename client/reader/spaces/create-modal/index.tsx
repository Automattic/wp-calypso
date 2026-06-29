import { SpaceUpsertModal } from 'calypso/reader/spaces/customize-modal';
import type { ReadSpace } from '@automattic/api-core';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onCreated?: ( space: ReadSpace ) => void;
}

export function CreateSpaceModal( { isOpen, onClose, onCreated }: Props ) {
	return (
		<SpaceUpsertModal isOpen={ isOpen } mode="create" onClose={ onClose } onCreated={ onCreated } />
	);
}
