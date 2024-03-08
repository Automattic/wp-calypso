import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import ProductsSelector from 'calypso/my-sites/earn/components/add-edit-coupon-modal/products-selector';
import { useDispatch } from 'calypso/state';
import { requestAddGift } from 'calypso/state/memberships/gifts/actions';

type GiftSubscriptionModalProps = {
	userId: number;
	siteId: number;
	username: string;
	onCancel: () => void;
	onConfirm: () => void;
};

type Gift = {
	gift_id: number | null;
	user_id: number;
	plan_id: number;
};

const GiftSubscriptionModal = ( {
	siteId,
	userId,
	username,
	onCancel,
	onConfirm,
}: GiftSubscriptionModalProps ) => {
	const translate = useTranslate();

	const dispatch = useDispatch();

	const [ planId, setPlanId ] = useState( 0 );

	const title = translate( 'Gift a subscription' );

	const text = translate( 'Select a plan to gift to this user: ' );

	const giftSubscription = ( plan_id: number, user_id: number, username: string ) => {
		const giftDetails: Gift = {
			gift_id: null,
			plan_id: plan_id,
			user_id: user_id,
		};

		dispatch(
			requestAddGift(
				siteId,
				giftDetails,
				translate( 'Gifted subscription to user "%(username)s".', {
					args: {
						username: username,
					},
				} ),
				onConfirm
			)
		);
	};

	return (
		<Modal overlayClassName="confirm-modal" title={ title } onRequestClose={ onCancel }>
			{ text && <p>{ text }</p> }
			<ProductsSelector
				onSelectedPlanIdsChange={ ( list ) => setPlanId( list[ 0 ] ?? 0 ) }
				initialSelectedList={ [] }
				allowMultiple={ false }
			/>
			<div className="confirm-modal__buttons">
				<Button className="confirm-modal__cancel" onClick={ onCancel }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button
					onClick={ () => giftSubscription( planId, userId, username ) }
					primary
					disabled={ planId === 0 }
				>
					{ translate( 'Confirm' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default GiftSubscriptionModal;
