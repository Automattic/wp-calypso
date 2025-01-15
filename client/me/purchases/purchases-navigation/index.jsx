import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Search from 'calypso/components/search';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { billingHistory, paymentMethods, purchasesRoot } from 'calypso/me/purchases/paths.js';
import titles from 'calypso/me/purchases/titles';
import { setQuery } from 'calypso/state/billing-transactions/ui/actions';

export default function PurchasesNavigation( { section } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const useDataViewBillingHistoryList = config.isEnabled( 'purchases/billing-history-data-view' );

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

			{ section === 'billingHistory' && ! useDataViewBillingHistoryList && (
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
