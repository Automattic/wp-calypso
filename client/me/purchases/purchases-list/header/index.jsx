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
import NavItem from 'client/components/section-nav/item';
import NavTabs from 'client/components/section-nav/tabs';
import paths from '../../paths.js';
import SectionNav from 'client/components/section-nav';

const PurchasesHeader = ( { section } ) => {
	let text = i18n.translate( 'Billing History' );

	if ( section === 'purchases' ) {
		text = i18n.translate( 'Purchases' );
	}

	return (
		<SectionNav selectedText={ text }>
			<NavTabs>
				<NavItem path={ paths.purchasesRoot() } selected={ section === 'purchases' }>
					{ i18n.translate( 'Purchases' ) }
				</NavItem>

				<NavItem path={ paths.billingHistory() } selected={ section === 'billing' }>
					{ i18n.translate( 'Billing History' ) }
				</NavItem>
			</NavTabs>
		</SectionNav>
	);
};

PurchasesHeader.propTypes = {
	section: PropTypes.string.isRequired,
};

export default PurchasesHeader;
