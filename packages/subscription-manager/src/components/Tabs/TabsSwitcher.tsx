/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import { useCurrentRoute } from 'calypso/components/route';
import Tab from './Tab';
import Tabs from './Tabs';

type TabItem = {
	count?: number;
	label: string;
	path: string;
	view: React.ElementType;
};

type TabsProps = {
	baseRoute: string;
	defaultTab: string;
	tabs: TabItem[];
};

const getRoute = ( baseRoute: string, path: string ): string => `/${ baseRoute }/${ path }`;
const getPath = ( route: string ) => route.substring( route.lastIndexOf( '/' ) + 1 );

const TabsSwitcher = ( { baseRoute, tabs }: TabsProps ) => {
	const { currentRoute } = useCurrentRoute();
	const CurrentView = tabs.find( ( tab ) => tab.path === getPath( currentRoute ) )?.view;

	return (
		<>
			<Tabs>
				{ tabs.map( ( { count, label, path } ) => (
					<Tab key={ path } path={ getRoute( baseRoute, path ) }>
						{ label }
						{ count !== undefined && <span className="count">{ count }</span> }
					</Tab>
				) ) }
			</Tabs>

			{ CurrentView && <CurrentView /> }
		</>
	);
};

export default TabsSwitcher;
