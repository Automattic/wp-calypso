/** @format */

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
import { billingHistory, upcomingCharges, purchasesRoot } from '../../paths.js';
import SectionNav from 'components/section-nav';
import config from 'config';
import getPastBillingTransactions from 'state/selectors/get-past-billing-transactions';

const PurchasesHeader = ( { pastTransactions, section, translate } ) => {
	let text = translate( 'Billing History' );

	if ( section === 'purchases' ) {
		text = translate( 'Purchases' );
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

				{ pastTransactions && (
					<NavItem path={ upcomingCharges } selected={ section === 'upcoming' }>
						{ translate( 'Upcoming Charges' ) }
					</NavItem>
				) }

				{ config.isEnabled( 'async-payments' ) && (
					<NavItem path={ purchasesRoot + '/pending' } selected={ section === 'pending' }>
						{ translate( 'Pending Payments' ) }
					</NavItem>
				) }

				<NavItem path={ purchasesRoot + '/memberships' } selected={ section === 'memberships' }>
					{ translate( 'My Memberships' ) }
				</NavItem>
			</NavTabs>
		</SectionNav>
	);
};

PurchasesHeader.propTypes = {
	section: PropTypes.string.isRequired,
};

export default connect( state => ( {
	pastTransactions: getPastBillingTransactions( state ),
} ) )( localize( PurchasesHeader ) );
