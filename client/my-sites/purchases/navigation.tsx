import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import Search from 'calypso/components/search';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { setQuery } from 'calypso/state/billing-transactions/ui/actions';

export default function PurchasesNavigation( {
	sectionTitle,
	siteSlug,
}: {
	sectionTitle: string;
	siteSlug: string | null;
} ): JSX.Element {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return (
		<SectionNav selectedText={ sectionTitle }>
			<NavTabs label="Section" selectedText={ sectionTitle }>
				<NavItem
					path={ `/purchases/subscriptions/${ siteSlug }` }
					selected={ sectionTitle === 'Active Upgrades' }
				>
					{ translate( 'Active Upgrades' ) }
				</NavItem>
				<NavItem
					path={ `/purchases/billing-history/${ siteSlug }` }
					selected={ sectionTitle === 'Billing History' }
				>
					{ translate( 'Billing History' ) }
				</NavItem>
				<NavItem
					path={ `/purchases/payment-methods/${ siteSlug }` }
					selected={ sectionTitle === 'Payment Methods' }
				>
					{ translate( 'Payment Methods' ) }
				</NavItem>
			</NavTabs>

			{ sectionTitle === 'Billing History' && (
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
