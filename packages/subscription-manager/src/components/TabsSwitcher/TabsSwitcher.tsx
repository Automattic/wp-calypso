/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import { useLocation } from 'react-router-dom';
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

const getRoute = ( baseRoute: string, path: string ): string => {
	// This is a temporary redirect to the re-skinned Subscription Management portal.
	// Once the new "Commnets" and "Sites" views are ready, this will be removed.
	const temporaryRedirect = [ 'comments', 'sites' ];
	if ( temporaryRedirect.includes( path ) ) {
		return `https://wordpress.com/email-subscriptions/?option=${ path }`;
	}

	return `/${ baseRoute }/${ path }`;
};
const getPath = ( route: string ) => route.substring( route.lastIndexOf( '/' ) + 1 );

const TabsSwitcher = ( { baseRoute, tabs }: TabsSwitcherProps ) => {
	const { pathname } = useLocation();
	const currentPath = getPath( pathname );
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
