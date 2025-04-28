import { useQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack, Dropdown, Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { siteQuery } from '../app/queries';
import { siteRoute } from '../app/router';
import HeaderBar from '../header-bar';
import MenuDivider from '../menu-divider';
import SiteIcon from '../site-icon';
import SiteMenu from '../site-menu';
import Switcher from './switcher';

function Site() {
	const isDesktop = useViewportMatch( 'medium' );
	const { siteId } = siteRoute.useParams();
	const { data } = useQuery( siteQuery( siteId ) );

	if ( ! data ) {
		return;
	}

	const { site } = data;

	return (
		<>
			<HeaderBar>
				<HStack justify={ isDesktop ? 'flex-start' : 'space-between' } spacing={ 4 }>
					<HeaderBar.Title>
						<Dropdown
							renderToggle={ ( { onToggle } ) => (
								<Button className="dashboard-menu__item active" onClick={ () => onToggle() }>
									<div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
										<SiteIcon site={ site } size={ 24 } /> { site.name }
									</div>
								</Button>
							) }
							renderContent={ ( { onClose } ) => <Switcher onClose={ onClose } /> }
						/>
					</HeaderBar.Title>
					{ isDesktop && <MenuDivider /> }
					<SiteMenu siteId={ site.ID } />
				</HStack>
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Site;
