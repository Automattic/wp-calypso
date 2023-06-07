import { TranslateResult, useTranslate } from 'i18n-calypso';
import Search from 'calypso/components/search';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import titles from 'calypso/me/purchases/titles.js';
import { useDispatch } from 'calypso/state';
import { setQuery } from 'calypso/state/billing-transactions/ui/actions';

type Titles = Record< keyof typeof titles, TranslateResult >;

export default function PurchasesNavigation( {
	section,
	siteSlug,
}: {
	section: keyof Titles;
	siteSlug: string | null;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return (
		<SectionNav selectedText={ titles[ section ] }>
			<NavTabs label="Section" selectedText={ titles[ section ] }>
				<NavItem
					path={ `/purchases/subscriptions/${ siteSlug }` }
					selected={ isJetpackCloud() ? section === 'myPlan' : section === 'activeUpgrades' }
				>
					{ isJetpackCloud() ? titles.myPlan : titles.activeUpgrades }
				</NavItem>
				<NavItem
					path={ `/purchases/billing-history/${ siteSlug }` }
					selected={ section === 'billingHistory' }
				>
					{ titles.billingHistory }
				</NavItem>
				<NavItem
					path={ `/purchases/payment-methods/${ siteSlug }` }
					selected={ section === 'paymentMethods' }
				>
					{ titles.paymentMethods }
				</NavItem>
			</NavTabs>

			{ section === 'billingHistory' && (
				<Search
					pinned
					fitsContainer
					onSearch={ ( term: string ) => {
						dispatch( setQuery( 'past', term ) );
					} }
					placeholder={ translate( 'Search all receipts…' ) }
					analyticsGroup="Billing"
				/>
			) }
		</SectionNav>
	);
}
