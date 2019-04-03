/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import { billingHistory, purchasesRoot } from '../../paths.js';
import SectionNav from 'components/section-nav';
import config from 'config';

const PurchasesHeader = ( { section } ) => {
	let text = i18n.translate( 'Billing History' );

	if ( section === 'purchases' ) {
		text = i18n.translate( 'Purchases' );
	}

	return (
		<SectionNav selectedText={ text }>
			<NavTabs>
				<NavItem path={ purchasesRoot } selected={ section === 'purchases' }>
					{ i18n.translate( 'Purchases' ) }
				</NavItem>

				<NavItem path={ billingHistory } selected={ section === 'billing' }>
					{ i18n.translate( 'Billing History' ) }
				</NavItem>

				{ config.isEnabled( 'async-payments' ) && (
					<NavItem path={ purchasesRoot + '/pending' } selected={ section === 'pending' }>
						{ i18n.translate( 'Pending Payments' ) }
					</NavItem>
				) }

				<NavItem path={ purchasesRoot + '/memberships' } selected={ section === 'memberships' }>
					{ i18n.translate( 'My Memberships' ) }
				</NavItem>
			</NavTabs>
		</SectionNav>
	);
};

PurchasesHeader.propTypes = {
	section: PropTypes.string.isRequired,
};

export default PurchasesHeader;
