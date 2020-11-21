/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

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
} from 'calypso/me/purchases/paths';
import SectionNav from 'calypso/components/section-nav';
import config from 'calypso/config';

type Section = 'activeUpgrades' | 'billingHistory' | 'paymentMethods' | 'pendingPayments';

export default function PurchasesHeader( { section }: { section: Section } ): JSX.Element {
	const translate = useTranslate();

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
					{ navItems.paymentMethods }
				</NavItem>

				{ config.isEnabled( 'async-payments' ) && (
					<NavItem path={ pendingPayments } selected={ section === 'pendingPayments' }>
						{ navItems.pendingPayments }
					</NavItem>
				) }
			</NavTabs>
		</SectionNav>
	);
}

PurchasesHeader.propTypes = {
	section: PropTypes.string.isRequired,
};
