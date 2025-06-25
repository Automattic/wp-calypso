import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouteModal } from 'calypso/lib/route-modal';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AddOnsModal from '../add-ons-modal';

type ManageAddOnsButtonProps = {
	tracksEventName: string;
};

export default function ManageAddOnsButton( { tracksEventName }: ManageAddOnsButtonProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { isModalOpen, closeModal } = useRouteModal( 'add-ons-modal' );
	const [ isManageAddOnsModalOpen, setIsManageAddOnsModalOpen ] = useState( isModalOpen );

	const onClick = () => {
		dispatch( recordTracksEvent( tracksEventName ) );
		setIsManageAddOnsModalOpen( true );
	};

	const onCloseAddOnsModal = () => {
		closeModal();
		setIsManageAddOnsModalOpen( false );
	};

	return (
		<>
			<Button variant="tertiary" onClick={ onClick }>
				{ translate( 'Manage add-ons' ) }
			</Button>
			<AddOnsModal isOpen={ isManageAddOnsModalOpen } onClose={ onCloseAddOnsModal } />
		</>
	);
}
