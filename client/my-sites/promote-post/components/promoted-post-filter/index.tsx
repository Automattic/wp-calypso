import { isMobile } from '@automattic/viewport';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import CreditBalance from 'calypso/my-sites/promote-post/components/credit-balance';
import { TabType } from 'calypso/my-sites/promote-post/main';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getAdvertisingDashboardPath } from '../../utils';

type Props = {
	tabs: { id: TabType; name: string }[];
	selectedTab: TabType;
};

export default function PromotePostTabBar( { tabs, selectedTab }: Props ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const sectionNavProps = isMobile()
		? { allowDropdown: false, className: 'is-open promote-post__section-nav' }
		: {};

	return (
		<SectionNav { ...sectionNavProps }>
			<NavTabs>
				{ tabs.map( ( { id, name } ) => {
					return (
						<NavItem
							key={ id }
							path={ getAdvertisingDashboardPath( `/${ id }/${ selectedSiteSlug }` ) }
							selected={ selectedTab === id }
							children={ name }
						/>
					);
				} ) }
			</NavTabs>
			<CreditBalance />
		</SectionNav>
	);
}
