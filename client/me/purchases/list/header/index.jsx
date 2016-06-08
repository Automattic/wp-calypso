/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import paths from '../../paths.js';
import SectionNav from 'components/section-nav';

const PurchasesHeader = ( { section } ) => {
	let text = i18n.translate( 'Billing History' );

	if ( section === 'purchases' ) {
		text = i18n.translate( 'Purchases' );
	}

	return (
		<SectionNav selectedText={ text }>
			<NavTabs>
				<NavItem path={ paths.list() } selected={ section === 'purchases' }>
					{ i18n.translate( 'Purchases' ) }
				</NavItem>

				<NavItem path="/me/billing" selected={ section === 'billing' }>
					{ i18n.translate( 'Billing History' ) }
				</NavItem>
			</NavTabs>
		</SectionNav>
	);
};

PurchasesHeader.propTypes = {
	section: React.PropTypes.string.isRequired
};

export default PurchasesHeader;
