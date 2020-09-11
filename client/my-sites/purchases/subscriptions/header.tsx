/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize, LocalizeProps, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import { billingHistory, paymentMethods, purchasesRoot } from '../paths';
import SectionNav from 'components/section-nav';
import getPastBillingTransactions from 'state/selectors/get-past-billing-transactions';

const PurchasesHeader = ( {
	section,
	translate,
}: {
	section: string;
	translate: LocalizeProps[ 'translate' ];
} ) => {
	return (
		<SectionNav selectedText={ getSelectedText( section, translate ) }>
			<NavTabs>
				<NavItem path={ purchasesRoot } selected={ section === 'subscriptions' }>
					{ translate( 'Subscriptions' ) }
				</NavItem>

				<NavItem path={ billingHistory } selected={ section === 'history' }>
					{ translate( 'Billing history' ) }
				</NavItem>

				<NavItem path={ paymentMethods } selected={ section === 'payment-methods' }>
					{ translate( 'Payment methods' ) }
				</NavItem>
			</NavTabs>
		</SectionNav>
	);
};

function getSelectedText(
	section: string,
	translate: LocalizeProps[ 'translate' ]
): TranslateResult {
	switch ( section ) {
		case 'payment-methods':
			return translate( 'Payment methods' );
		case 'history':
			return translate( 'Billing history' );
		default:
			return translate( 'Subscriptions' );
	}
}

PurchasesHeader.propTypes = {
	section: PropTypes.string.isRequired,
};

export default connect( ( state ) => ( {
	pastTransactions: getPastBillingTransactions( state ),
} ) )( localize( PurchasesHeader ) );
