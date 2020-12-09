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

export default function PurchasesNavigation( { section } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const navItems = {
		activeUpgrades: translate( 'Active Upgrades' ),
		billingHistory: translate( 'Billing History' ),
		paymentMethods: translate( 'Payment Methods' ),
		pendingPayments: translate( 'Pending Payments' ),
	};

	return (
		<SectionNav selectedText={ navItems[ section ] }>
			<NavTabs>
				<NavItem path={ purchasesRoot } selected={ section === 'activeUpgrades' }>
					{ navItems.activeUpgrades }
				</NavItem>

				<NavItem path={ billingHistory } selected={ section === 'billingHistory' }>
					{ navItems.billingHistory }
				</NavItem>

				<NavItem path={ paymentMethods } selected={ section === 'paymentMethods' }>
					{ translate( 'Payment Methods' ) }
				</NavItem>

				{ isEnabled( 'async-payments' ) && (
					<NavItem path={ pendingPayments } selected={ section === 'pendingPayments' }>
						{ navItems.pendingPayments }
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

PurchasesNavigation.propTypes = {
	section: PropTypes.string.isRequired,
};
