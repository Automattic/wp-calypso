/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { Card } from '@automattic/components';
import { getAllStoredCards } from 'calypso/state/stored-cards/selectors';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import {
	VisaLogo,
	MastercardLogo,
	AmexLogo,
} from 'calypso/my-sites/checkout/composite-checkout/components/payment-logos';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

function StoredCard( props ): ReactElement {
	let logo;
	const translate = useTranslate();

	if ( 'visa' === props.card.card_type ) {
		logo = <VisaLogo />;
	} else if ( 'mastercard' === props.card.card_type ) {
		logo = <MastercardLogo />;
	} else if ( 'amex' === props.card.card_type ) {
		logo = <AmexLogo />;
	}

	const expiry = new Date( props.card.expiry );
	const month = expiry.getMonth();
	const year = expiry.getFullYear().toString().substr( 2, 2 );

	return (
		<div className="payment-method__stored-card">
			<div className="payment-method__stored-card-header">
				<div className="payment-method__stored-card-header-left">{ logo }</div>

				<div className="payment-method__stored-card-header-right">
					<Gridicon icon="checkmark" size={ 18 } />
					<div className="payment-method__stored-card-primary">
						<span className="payment-method__stored-card-primary-text">
							{ translate( 'Primary' ) }
						</span>
					</div>
					<EllipsisMenu className="payment-method__stored-card-ellipsis" position="bottom">
						<PopoverMenuItem>{ translate( 'Make primary' ) }</PopoverMenuItem>
						<PopoverMenuItem>{ translate( 'Update details' ) }</PopoverMenuItem>
						<PopoverMenuItem>{ translate( 'Delete card' ) }</PopoverMenuItem>
					</EllipsisMenu>
				</div>
			</div>
			<div className="payment-method__stored-card-footer">
				<div className="payment-method__stored-card-footer-left">
					<div className="payment-method__stored-card-name">{ props.card.name }</div>
					<div className="payment-method__stored-card-number">
						**** **** **** { props.card.card }
					</div>
				</div>

				<div className="payment-method__stored-card-footer-right">
					<div className="payment-method__stored-card-expiry">{ `${ month }/${ year }` }</div>
				</div>
			</div>
		</div>
	);
}

function AddStoredCard(): ReactElement {
	const translate = useTranslate();

	return (
		<div
			className="payment-method__add-card"
			onClick={ () => page( '/partner-portal/payment-method/add' ) }
		>
			<div className="payment-method__add-card-content">
				<CardHeading className="payment-method__add-card-text" size={ 18 }>
					{ translate( 'Add new credit card' ) }
				</CardHeading>
				<Gridicon className="payment-method__add-card-icon" icon="add-outline" size={ 48 } />
			</div>
		</div>
	);
}

export default function PaymentMethodList(): ReactElement {
	const translate = useTranslate();
	const storedCards = useSelector( ( state ) => getAllStoredCards( state ) );
	const cards = storedCards.map( ( card ) => <StoredCard key={ card.card } card={ card } /> );

	return (
		<Main wideLayout className="payment-method">
			<QueryStoredCards />
			<DocumentHead title={ translate( 'Payment Method' ) } />
			<SidebarNavigation />

			<div className="payment-method__header">
				<CardHeading size={ 36 }>{ translate( 'Payment Method' ) }</CardHeading>
			</div>

			<div className="payment-method__body">
				{ cards }
				<AddStoredCard />
			</div>
		</Main>
	);
}
