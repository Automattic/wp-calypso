/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import {
	billingHistory,
	paymentMethods,
	pendingPayments,
	purchasesRoot,
} from 'calypso/me/purchases/paths.js';
import SectionNav from 'calypso/components/section-nav';
import { isEnabled } from 'calypso/config';
import Search from 'calypso/components/search';
import { setQuery } from 'calypso/state/billing-transactions/ui/actions';

export default function PurchasesHeader( { section } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	let text = translate( 'Billing History' );

	if ( section === 'purchases' ) {
		text = translate( 'Purchases' );
	} else if ( section === 'pending' ) {
		text = translate( 'Pending Payments' );
	} else if ( section === 'payment-methods' ) {
		text = translate( 'Payment Methods' );
	}

	return (
		<SectionNav selectedText={ text }>
			<NavTabs>
				<NavItem path={ purchasesRoot } selected={ section === 'purchases' }>
					{ translate( 'Purchases' ) }
				</NavItem>

				<NavItem path={ billingHistory } selected={ section === 'billing' }>
					{ translate( 'Billing History' ) }
				</NavItem>

				<NavItem path={ paymentMethods } selected={ section === 'payment-methods' }>
					{ translate( 'Payment Methods' ) }
				</NavItem>

				{ isEnabled( 'async-payments' ) && (
					<NavItem path={ pendingPayments } selected={ section === 'pending' }>
						{ translate( 'Pending Payments' ) }
					</NavItem>
				) }
			</NavTabs>

			{ section === 'billing' && (
				<Search
					pinned
					fitsContainer
					onSearch={ ( term ) => {
						dispatch( setQuery( 'past', term ) );
					} }
					placeholder={ translate( 'Search all receipts…' ) }
					analyticsGroup="Billing"
				/>
			) }
		</SectionNav>
	);
}

PurchasesHeader.propTypes = {
	section: PropTypes.string.isRequired,
};
