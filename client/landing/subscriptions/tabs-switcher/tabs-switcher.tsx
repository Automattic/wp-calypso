import { useLocation } from 'react-router-dom';
import Nav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import './styles.scss';

export type TabItem = {
	count?: number;
	label: string;
	path: string;
	view: React.ElementType;
};

type TabsSwitcherProps = {
	baseRoute: string;
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
			<Nav className="subscription-manager-tab-switcher">
				<NavTabs>
					{ tabs.map( ( { count, label, path } ) => (
						<NavItem
							key={ path }
							path={ getRoute( baseRoute, path ) }
							count={ count }
							selected={ path === currentPath }
						>
							{ label }
						</NavItem>
					) ) }
				</NavTabs>
			</Nav>

			{ CurrentView && <CurrentView /> }
		</>
	);
};

export default TabsSwitcher;
