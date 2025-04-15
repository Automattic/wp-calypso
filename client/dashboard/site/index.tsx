import { useQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { siteQuery } from '../app/queries';
import { siteRoute } from '../app/router';
import HeaderBar from '../header-bar';
import MenuDivider from '../menu-divider';
import SiteIcon from '../site-icon';
import SiteMenu from '../site-menu';
import type { Site as SiteType } from '../data/types';

function Site() {
	const isDesktop = useViewportMatch( 'medium' );
	const { siteId } = siteRoute.useParams();
	const { site } = useQuery( siteQuery( siteId ) ).data as {
		site: SiteType;
	};

	return (
		<>
			<HeaderBar>
				<HStack justify={ isDesktop ? 'flex-start' : 'space-between' } spacing={ 4 }>
					<HeaderBar.Title>
						<SiteIcon site={ site } size={ 24 } />
						<span>{ site.name }</span>
					</HeaderBar.Title>
					{ isDesktop && <MenuDivider /> }
					<SiteMenu siteId={ site.id } />
				</HStack>
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Site;
