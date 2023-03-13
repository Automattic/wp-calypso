/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import SectionNav from 'calypso/components/section-nav';
import NavTabs from 'calypso/components/section-nav/tabs';
import Tab from './Tab';

type TabsProps = {
	children?: typeof Tab | typeof Tab[];
};

const Tabs = ( { children }: TabsProps ) => {
	return (
		<SectionNav>
			<NavTabs>{ children }</NavTabs>
		</SectionNav>
	);
};

export default Tabs;
