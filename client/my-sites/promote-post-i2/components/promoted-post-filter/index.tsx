import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { TabType } from 'calypso/my-sites/promote-post/main';
import { TabOption } from 'calypso/my-sites/promote-post-i2/main';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getAdvertisingDashboardPath } from '../../utils';

type Props = {
	tabs: TabOption[];
	selectedTab: TabType;
};

export default function PromotePostTabBar( { tabs, selectedTab }: Props ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	return (
		<SectionNav>
			<NavTabs>
				{ tabs.map( ( { id, name, itemCount } ) => {
					return (
						<NavItem
							key={ id }
							path={ getAdvertisingDashboardPath( `/${ selectedSiteSlug }/${ id }` ) }
							selected={ selectedTab === id }
							children={ name }
							count={ itemCount }
						/>
					);
				} ) }
			</NavTabs>
		</SectionNav>
	);
}
