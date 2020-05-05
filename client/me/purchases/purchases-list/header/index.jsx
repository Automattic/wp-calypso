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
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import {
	billingHistory,
	upcomingCharges,
	pendingPayments,
	myMemberships,
	purchasesRoot,
} from '../../paths.js';
import SectionNav from 'components/section-nav';
import config from 'config';
import getPastBillingTransactions from 'state/selectors/get-past-billing-transactions';

const PurchasesHeader = ( { section, translate } ) => {
	let text = translate( 'Billing History' );

	if ( section === 'purchases' ) {
		text = translate( 'Purchases' );
	} else if ( section === 'upcoming' ) {
		text = translate( 'Upcoming Charges' );
	} else if ( section === 'pending' ) {
		text = translate( 'Pending Payments' );
	} else if ( section === 'memberships' ) {
		text = translate( 'Other Sites' );
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

				<NavItem path={ upcomingCharges } selected={ section === 'upcoming' }>
					{ translate( 'Upcoming Charges' ) }
				</NavItem>

				{ config.isEnabled( 'async-payments' ) && (
					<NavItem path={ pendingPayments } selected={ section === 'pending' }>
						{ translate( 'Pending Payments' ) }
					</NavItem>
				) }

				<NavItem path={ myMemberships } selected={ section === 'memberships' }>
					{ translate( 'Other Sites' ) }
				</NavItem>
			</NavTabs>
		</SectionNav>
	);
};

PurchasesHeader.propTypes = {
	section: PropTypes.string.isRequired,
};

export default connect( ( state ) => ( {
	pastTransactions: getPastBillingTransactions( state ),
} ) )( localize( PurchasesHeader ) );
