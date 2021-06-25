/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { PaymentLogo } from '@automattic/composite-checkout';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

export default function StoredCreditCard( props ): ReactElement {
	const translate = useTranslate();
	const creditCard = props.card;

	const expiry = new Date( creditCard.expiry );
	const month = expiry.getMonth();
	const year = expiry.getFullYear().toString().substr( 2, 2 );

	return (
		<div className="stored-credit-card">
			<div className="stored-credit-card__header">
				<div className="stored-credit-card__header-left">
					<PaymentLogo brand={ creditCard.card_type } isSummary={ true } />
				</div>

				<div className="stored-credit-card__header-right">
					<Gridicon icon="checkmark" size={ 18 } />
					<div className="stored-credit-card__primary">
						<span className="stored-credit-card__primary-text">{ translate( 'Primary' ) }</span>
					</div>
					<EllipsisMenu className="stored-credit-card__ellipsis" position="bottom">
						<PopoverMenuItem>{ translate( 'Make primary' ) }</PopoverMenuItem>
						<PopoverMenuItem>{ translate( 'Update details' ) }</PopoverMenuItem>
						<PopoverMenuItem>{ translate( 'Delete card' ) }</PopoverMenuItem>
					</EllipsisMenu>
				</div>
			</div>
			<div className="stored-credit-card__footer">
				<div className="stored-credit-card__footer-left">
					<div className="stored-credit-card__name">{ creditCard.name }</div>
					<div className="stored-credit-card__number">**** **** **** { creditCard.card }</div>
				</div>

				<div className="stored-credit-card__footer-right">
					<div className="stored-credit-card__expiry">{ `${ month }/${ year }` }</div>
				</div>
			</div>
		</div>
	);
}
