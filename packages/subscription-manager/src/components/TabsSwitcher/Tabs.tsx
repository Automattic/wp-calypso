/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import SectionNav from 'calypso/components/section-nav';
import Tab from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';

type TabsProps = {
	children?: React.ReactElement< typeof Tab >[];
};

const Tabs = ( { children }: TabsProps ) => (
	<SectionNav className="subscription-manager-tab-switcher">
		<NavTabs>{ children }</NavTabs>
	</SectionNav>
);

export default Tabs;
