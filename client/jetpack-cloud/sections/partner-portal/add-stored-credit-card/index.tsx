import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

export default function AddStoredCreditCard(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const navigateToCreateAddCard = () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_payment_method_add_new_card_click' ) );
	};

	return (
		<a
			className="add-stored-credit-card"
			href="/partner-portal/payment-method/card"
			onClick={ navigateToCreateAddCard }
		>
			<div className="add-stored-credit-card__content">
				<CardHeading className="add-stored-credit-card__title" tagName="h3">
					<Gridicon key="add-card-icon" icon="add-outline" size={ 24 } />
					<span key="add-card-text">{ translate( 'New Credit Card' ) }</span>
				</CardHeading>

				<Button>{ translate( 'Add new credit card' ) }</Button>
			</div>
		</a>
	);
}
