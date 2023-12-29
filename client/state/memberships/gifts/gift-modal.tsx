import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import ProductsSelector from 'calypso/my-sites/earn/components/add-edit-coupon-modal/products-selector';

type GiftSubscriptionModalProps = {
	userId: number;
	onCancel: () => void;
	onConfirm: () => void;
};

const GiftSubscriptionModal = ( { userId, onCancel, onConfirm }: GiftSubscriptionModalProps ) => {
	const translate = useTranslate();

	const [ planId, setPlanId ] = useState( 0 );

	const title = translate( 'Gift a subscription' );

	const text = translate( 'Select a plan to gift to this user: ' );

	const giftsubscription = () => {
		alert( userId );
		onConfirm();
	};

	return (
		<Modal overlayClassName="confirm-modal" title={ title } onRequestClose={ onCancel }>
			{ text && <p>{ text }</p> }
			<ProductsSelector
				onSelectedPlanIdsChange={ ( list ) => setPlanId( list[ 0 ] ?? 0 ) }
				initialSelectedList={ [] }
			/>
			<div className="confirm-modal__buttons">
				<Button className="confirm-modal__cancel" onClick={ onCancel }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button onClick={ giftsubscription } primary disabled={ planId !== 0 }>
					{ translate( 'Confirm' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default GiftSubscriptionModal;
