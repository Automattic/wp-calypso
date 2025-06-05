import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import titles from 'calypso/me/purchases/titles.js';
import type { TranslateResult } from 'i18n-calypso';

type Titles = Record< keyof typeof titles, TranslateResult >;

export default function PurchasesNavigation( {
	section,
	siteSlug,
}: {
	section: keyof Titles;
	siteSlug: string | null;
} ) {
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
		</SectionNav>
	);
}
