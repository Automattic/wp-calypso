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
import titles from 'calypso/me/purchases/titles';
import SectionNav from 'calypso/components/section-nav';
import { isEnabled } from '@automattic/calypso-config';
import Search from 'calypso/components/search';
import { setQuery } from 'calypso/state/billing-transactions/ui/actions';

export default function PurchasesNavigation( { section } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return (
		<SectionNav selectedText={ titles[ section ] }>
			<NavTabs>
				<NavItem path={ purchasesRoot } selected={ section === 'activeUpgrades' }>
					{ titles.activeUpgrades }
				</NavItem>

				<NavItem path={ billingHistory } selected={ section === 'billingHistory' }>
					{ titles.billingHistory }
				</NavItem>

				<NavItem path={ paymentMethods } selected={ section === 'paymentMethods' }>
					{ titles.paymentMethods }
				</NavItem>

				{ isEnabled( 'async-payments' ) && (
					<NavItem path={ pendingPayments } selected={ section === 'pendingPayments' }>
						{ titles.pendingPayments }
					</NavItem>
				) }
			</NavTabs>

			{ section === 'billingHistory' && (
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
