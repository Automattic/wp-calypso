// eslint-disable-next-line no-restricted-imports
import SectionNav from 'calypso/components/section-nav';
// eslint-disable-next-line no-restricted-imports
import NavItem from 'calypso/components/section-nav/item';
// eslint-disable-next-line no-restricted-imports
import NavTabs from 'calypso/components/section-nav/tabs';
import SiteItem from '../SiteItem';

export const SitesList = () => {
	return (
		<>
			<div>Sites List</div>
			<SectionNav>
				<NavTabs>
					<NavItem>Sites</NavItem>
					<NavItem>Comments</NavItem>
					<NavItem selected={ true }>Settings</NavItem>
				</NavTabs>
			</SectionNav>
			<SiteItem />
		</>
	);
};
