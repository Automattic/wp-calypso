/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

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
import config from 'calypso/config';
import getPastBillingTransactions from 'calypso/state/selectors/get-past-billing-transactions';

const PurchasesNavigation = ( { section, translate } ) => {
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

				{ config.isEnabled( 'async-payments' ) && (
					<NavItem path={ pendingPayments } selected={ section === 'pending' }>
						{ translate( 'Pending Payments' ) }
					</NavItem>
				) }
			</NavTabs>
		</SectionNav>
	);
};

PurchasesNavigation.propTypes = {
	section: PropTypes.string.isRequired,
};

export default connect( ( state ) => ( {
	pastTransactions: getPastBillingTransactions( state ),
} ) )( localize( PurchasesNavigation ) );
