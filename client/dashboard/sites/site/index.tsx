import { useQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack, Dropdown, Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { siteQuery } from '../../app/queries';
import { siteRoute } from '../../app/router';
import HeaderBar from '../../components/header-bar';
import MenuDivider from '../../components/menu-divider';
import SiteIcon from '../site-icon';
import SiteMenu from '../site-menu';
import Switcher from './switcher';

function Site() {
	const isDesktop = useViewportMatch( 'medium' );
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteQuery( siteSlug ) );

	if ( ! site ) {
		return;
	}

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
					<SiteMenu siteSlug={ siteSlug } />
				</HStack>
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Site;
