import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Suspense, useMemo, lazy } from 'react';
import { useAppContext } from '../../app/context';
import { siteRoute } from '../../app/router/sites';
import StagingSiteSyncMonitor from '../../app/staging-site-sync-monitor';
import FlashMessage from '../../components/flash-message';
import HeaderBar from '../../components/header-bar';
import MenuDivider from '../../components/menu-divider';
import { hasStagingSite } from '../../utils/site-staging-site';
import { isSiteMigrationInProgress } from '../../utils/site-status';
import { canSwitchEnvironment } from '../features';
import SiteMenu from '../site-menu';
import EnvironmentSwitcher from './environment-switcher';

function Site() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site, isError, error } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { components } = useAppContext();
	const SiteSwitcher = useMemo( () => lazy( components.siteSwitcher ), [ components ] );

	if ( isError ) {
		throw error;
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
			<Suspense fallback={ null }>
				<FlashMessage
					id="route-not-allowed"
					key={ siteSlug }
					type="error"
					message={ __( 'You don’t have permission to view the requested page.' ) }
				/>
				<Outlet />
			</Suspense>
		</Suspense>
	);
}

export default Site;
