import PropTypes from 'prop-types';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { billingHistory, paymentMethods, purchasesRoot } from 'calypso/me/purchases/paths.js';
import titles from 'calypso/me/purchases/titles';

export default function PurchasesNavigation( { section } ) {
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
			</NavTabs>
		</SectionNav>
	);
}

PurchasesNavigation.propTypes = {
	section: PropTypes.string.isRequired,
};
