import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AddOnsModal from '../add-ons-modal';

type ManageAddOnsButtonProps = {
	tracksEventName: string;
};

export default function ManageAddOnsButton( { tracksEventName }: ManageAddOnsButtonProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isManageAddOnsModalOpen, setIsManageAddOnsModalOpen ] = useState( false );

	const onClick = () => {
		dispatch( recordTracksEvent( tracksEventName ) );
		setIsManageAddOnsModalOpen( true );
	};

	return (
		<>
			<Button variant="tertiary" onClick={ onClick }>
				{ translate( 'Manage add-ons' ) }
			</Button>
			<AddOnsModal
				isOpen={ isManageAddOnsModalOpen }
				onClose={ () => setIsManageAddOnsModalOpen( false ) }
			/>
		</>
	);
}
