/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import { useCurrentRoute } from 'calypso/components/route';
import Tab from 'calypso/components/section-nav/item';
import Tabs from './Tabs';
import './styles.scss';

type TabItem = {
	count?: number;
	label: string;
	path: string;
	view: React.ElementType;
};

type TabsSwitcherProps = {
	baseRoute: string;
	defaultTab: string;
	tabs: TabItem[];
};

const getRoute = ( baseRoute: string, path: string ): string => `/${ baseRoute }/${ path }`;
const getPath = ( route: string ) => route.substring( route.lastIndexOf( '/' ) + 1 );

const TabsSwitcher = ( { baseRoute, tabs }: TabsSwitcherProps ) => {
	const { currentRoute } = useCurrentRoute();
	const currentPath = getPath( currentRoute );
	const CurrentView = tabs.find( ( tab ) => tab.path === currentPath )?.view;

	return (
		<>
			<Tabs>
				{ tabs.map( ( { count, label, path } ) => (
					<Tab
						key={ path }
						path={ getRoute( baseRoute, path ) }
						count={ count }
						selected={ path === currentPath }
					>
						{ label }
					</Tab>
				) ) }
			</Tabs>

			{ CurrentView && <CurrentView /> }
		</>
	);
};

export default TabsSwitcher;
