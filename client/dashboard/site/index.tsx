import { useQuery } from '@tanstack/react-query';
import { useLoaderData, Outlet, createLazyRoute } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import HeaderBar from '../header-bar';
import MenuDivider from '../menu-divider';
import SiteIcon from '../site-icon';
import SiteMenu from '../site-menu';
import type { Site as SiteType } from '../data/types';

function Site() {
	const isDesktop = useViewportMatch( 'medium' );
	const { site } = useQuery( useLoaderData( { from: '/sites/$siteId' } ) ).data as {
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

export const Route = createLazyRoute( 'site/$siteId' )( {
	component: Site,
} );
