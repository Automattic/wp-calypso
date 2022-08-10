import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import './style.scss';
import { TabType } from 'calypso/my-sites/promote-post/main';

type Props = {
	tabs: { id: TabType; name: string }[];
	selectedTab: TabType;
	selectTab: ( tab: TabType ) => void;
};

export default function PromotePostTabBar( { tabs, selectedTab, selectTab }: Props ) {
	return (
		<SectionNav>
			<NavTabs>
				{ tabs.map( ( { id, name } ) => {
					return (
						<NavItem
							key={ id }
							onClick={ () => selectTab( id ) }
							selected={ selectedTab === id }
							children={ name }
						/>
					);
				} ) }
			</NavTabs>
		</SectionNav>
	);
}
