import { useSelector } from 'react-redux';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { TabType } from 'calypso/my-sites/promote-post/main';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

type Props = {
	tabs: { id: TabType; name: string }[];
	selectedTab: TabType;
};

export default function PromotePostTabBar( { tabs, selectedTab }: Props ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	return (
		<SectionNav>
			<NavTabs>
				{ tabs.map( ( { id, name } ) => {
					return (
						<NavItem
							key={ id }
							path={ `/advertising/${ selectedSiteSlug }/${ id }` }
							selected={ selectedTab === id }
							children={ name }
						/>
					);
				} ) }
			</NavTabs>
		</SectionNav>
	);
}
