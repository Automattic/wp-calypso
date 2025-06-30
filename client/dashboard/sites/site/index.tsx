import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, notFound } from '@tanstack/react-router';
import { __experimentalHStack as HStack, Dropdown, Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { chevronDownSmall } from '@wordpress/icons';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteRoute } from '../../app/router';
import HeaderBar from '../../components/header-bar';
import MenuDivider from '../../components/menu-divider';
import { getSiteName } from '../../utils/site-name';
import { canManageSite } from '../features';
import SiteIcon from '../site-icon';
import SiteMenu from '../site-menu';
import Switcher from './switcher';

function Site() {
	const isDesktop = useViewportMatch( 'medium' );
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	if ( ! canManageSite( site ) ) {
		throw notFound();
	}

	return (
		<>
			<HeaderBar>
				<HStack justify={ isDesktop ? 'flex-start' : 'space-between' } spacing={ 3 }>
					<HeaderBar.Title>
						<Dropdown
							renderToggle={ ( { onToggle } ) => (
								<Button
									className="dashboard-menu__item active"
									icon={ chevronDownSmall }
									iconPosition="right"
									onClick={ () => onToggle() }
								>
									<div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
										<SiteIcon site={ site } size={ 16 } /> { getSiteName( site ) }
									</div>
								</Button>
							) }
							renderContent={ ( { onClose } ) => <Switcher onClose={ onClose } /> }
						/>
					</HeaderBar.Title>
					{ isDesktop && <MenuDivider /> }
					<SiteMenu site={ site } />
				</HStack>
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Site;
