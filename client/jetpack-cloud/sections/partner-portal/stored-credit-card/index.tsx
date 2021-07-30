/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { PaymentLogo } from '@automattic/composite-checkout';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	card: StoredCard;
}

export default function StoredCreditCard( props: Props ): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const creditCard = props.card;

	const [ year, expiryMonth ] = creditCard.expiry.split( '-' );
	const expiryYear = year.substr( 2, 2 );

	const navigateToStoredCard = () => {
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_license_list_empty_issue_license_click' )
		);
	};

	return (
		<a
			href={ '/partner-portal/payment-method/card/?details_id=' + creditCard.stored_details_id }
			onClick={ navigateToStoredCard }
			className="stored-credit-card"
		>
			<div className="stored-credit-card__header">
				<div className="stored-credit-card__payment-logo">
					<PaymentLogo brand={ creditCard.card_type } isSummary={ true } />
				</div>

				<div className="stored-credit-card__primary">{ translate( 'Primary' ) }</div>
			</div>
			<div className="stored-credit-card__footer">
				<div className="stored-credit-card__footer-left">
					<div className="stored-credit-card__name">{ creditCard.name }</div>
					<div className="stored-credit-card__number">**** **** **** { creditCard.card }</div>
				</div>

				<div className="stored-credit-card__footer-right">
					<div className="stored-credit-card__expiry">{ `${ expiryMonth }/${ expiryYear }` }</div>
				</div>
			</div>
		</a>
	);
}
