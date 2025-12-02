import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, notFound } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { Suspense, useMemo, lazy } from 'react';
import { useAppContext } from '../../app/context';
import { siteRoute } from '../../app/router/sites';
import StagingSiteSyncMonitor from '../../app/staging-site-sync-monitor';
import HeaderBar from '../../components/header-bar';
import MenuDivider from '../../components/menu-divider';
import { hasStagingSite } from '../../utils/site-staging-site';
import { isSiteMigrationInProgress } from '../../utils/site-status';
import { canManageSite, canSwitchEnvironment } from '../features';
import SiteMenu from '../site-menu';
import EnvironmentSwitcher from './environment-switcher';

function Site() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { components } = useAppContext();
	const SiteSwitcher = useMemo( () => lazy( components.siteSwitcher ), [ components ] );

	if ( ! canManageSite( site ) ) {
		throw notFound();
	}

	return (
		<Suspense fallback={ null }>
			{ hasStagingSite( site ) && <StagingSiteSyncMonitor site={ site } /> }
			<HeaderBar>
				<HStack spacing={ 3 }>
					<HeaderBar.Title>
						<SiteSwitcher />
						{ canSwitchEnvironment( site ) && (
							<>
								<MenuDivider />
								<EnvironmentSwitcher site={ site } />
							</>
						) }
					</HeaderBar.Title>
					{ ! isSiteMigrationInProgress( site ) && <SiteMenu site={ site } /> }
				</HStack>
			</HeaderBar>
			<Outlet />
		</Suspense>
	);
}

export default Site;
