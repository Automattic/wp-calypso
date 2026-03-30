import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Modal, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import ProductsSelector from 'calypso/my-sites/earn/components/add-edit-coupon-modal/products-selector';
import { useDispatch } from 'calypso/state';
import { requestAddComp } from 'calypso/state/memberships/comps/actions';

import './style.scss';

type CompSubscriptionModalProps = {
	userId: number | string;
	siteId: number;
	username: string;
	onClose: () => void;
	onConfirm: () => void;
};

type Comp = {
	user_id: number | string;
	plan_id: number;
};

const CompSubscriptionModal = ( {
	siteId,
	userId,
	username,
	onClose,
	onConfirm,
}: CompSubscriptionModalProps ) => {
	const translate = useTranslate();

	const dispatch = useDispatch();

	const [ planId, setPlanId ] = useState( 0 );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	useEffect( () => {
		recordTracksEvent( 'calypso_subscribers_comp_modal_open', {
			site_id: siteId,
		} );
	}, [ siteId ] );

	const addCompSubscription = ( plan_id: number, user_id: number | string, username: string ) => {
		setIsSubmitting( true );

		recordTracksEvent( 'calypso_subscribers_comp_modal_confirm', {
			site_id: siteId,
			plan_id: plan_id,
			user_id: typeof user_id === 'number' ? user_id : 0,
			is_email_subscriber: typeof user_id !== 'number',
		} );

		const onComplete = ( { success }: { success: boolean } ) => {
			setIsSubmitting( false );
			if ( success ) {
				onConfirm();
			}
			onClose();
		};

		const noticeText = translate( 'Gave complimentary subscription to user "%(username)s".', {
			args: {
				username: username,
			},
		} );

		const compDetails: Comp = {
			plan_id: plan_id,
			user_id: user_id,
		};

		dispatch( requestAddComp( siteId, compDetails, noticeText, onComplete ) );
	};

	return (
		<Modal
			overlayClassName="complimentary-subscription-modal"
			title={ translate( 'Complimentary subscription' ) }
			onRequestClose={ onClose }
		>
			<p>{ translate( 'Select a plan to give complimentary access to this user:' ) }</p>
			<ProductsSelector
				onSelectedPlanIdsChange={ ( list ) => setPlanId( list[ 0 ] ?? 0 ) }
				initialSelectedList={ [] }
				allowMultiple={ false }
				showLabel={ false }
			/>
			<div className="complimentary-subscription-modal__buttons">
				<Button onClick={ onClose } variant="tertiary">
					{ translate( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					isBusy={ isSubmitting }
					onClick={ () => addCompSubscription( planId, userId, username ) }
					disabled={ planId === 0 || isSubmitting }
				>
					{ translate( 'Confirm' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default CompSubscriptionModal;
