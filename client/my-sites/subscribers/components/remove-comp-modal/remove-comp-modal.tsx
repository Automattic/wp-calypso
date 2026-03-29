import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { requestDeleteComp } from 'calypso/state/memberships/comps/actions';
import { requestDeleteGift } from 'calypso/state/memberships/gifts/actions';

import './style.scss';

type RemoveCompModalProps = {
	siteId: number;
	giftId?: number;
	compId?: number;
	planName: string;
	username: string;
	useComps: boolean;
	onClose: () => void;
	onRemoved: () => void;
};

const RemoveCompModal = ( {
	siteId,
	giftId,
	compId,
	planName,
	username,
	useComps,
	onClose,
	onRemoved,
}: RemoveCompModalProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const isMissingId = useComps ? ! compId : ! giftId;

	const handleRemove = () => {
		setIsSubmitting( true );

		const noticeText = translate( 'Removed complimentary subscription from "%(username)s".', {
			args: { username },
		} );

		const onSuccess = () => {
			queryClient.invalidateQueries( { queryKey: [ 'subscribers', siteId ] } );
			queryClient.invalidateQueries( { queryKey: [ 'subscriber-details', siteId ] } );
			setIsSubmitting( false );
			onRemoved();
		};

		const onError = () => {
			setIsSubmitting( false );
		};

		if ( useComps && compId ) {
			recordTracksEvent( 'calypso_subscribers_remove_comp_confirm', {
				site_id: siteId,
				comp_id: compId,
			} );

			dispatch( requestDeleteComp( siteId, compId, noticeText ) ).then( onSuccess, onError );
		} else if ( giftId ) {
			recordTracksEvent( 'calypso_subscribers_remove_comp_confirm', {
				site_id: siteId,
				gift_id: giftId,
			} );

			dispatch( requestDeleteGift( siteId, giftId, noticeText ) ).then( onSuccess, onError );
		}
	};

	return (
		<Modal
			overlayClassName="remove-comp-modal"
			title={ translate( 'Remove complimentary subscription' ) }
			onRequestClose={ onClose }
			size="medium"
		>
			<p>
				{ translate(
					'Are you sure you want to remove the complimentary "%(planName)s" subscription from %(username)s? They will lose access to the paid content in this plan.',
					{
						args: { planName, username },
					}
				) }
			</p>
			<div className="remove-comp-modal__buttons">
				<Button onClick={ onClose } variant="tertiary">
					{ translate( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					isBusy={ isSubmitting }
					onClick={ handleRemove }
					disabled={ isSubmitting || isMissingId }
				>
					{ translate( 'Remove' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default RemoveCompModal;
