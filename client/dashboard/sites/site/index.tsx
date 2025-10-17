import { siteBySlugQuery, sitesQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, notFound } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	MenuGroup,
	MenuItem,
	Icon,
	Modal,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useState } from 'react';
import { useAppContext } from '../../app/context';
import useBuildCurrentRouteLink from '../../app/hooks/use-build-current-route-link';
import { siteRoute } from '../../app/router/sites';
import StagingSiteSyncMonitor from '../../app/staging-site-sync-monitor';
import HeaderBar from '../../components/header-bar';
import MenuDivider from '../../components/menu-divider';
import Switcher from '../../components/switcher';
import { getSiteDisplayName } from '../../utils/site-name';
import { hasStagingSite } from '../../utils/site-staging-site';
import { isSiteMigrationInProgress } from '../../utils/site-status';
import AddNewSite from '../add-new-site';
import { canManageSite, canSwitchEnvironment } from '../features';
import SiteIcon from '../site-icon';
import SiteMenu from '../site-menu';
import EnvironmentSwitcher from './environment-switcher';

function Site() {
	const { onboardingLinkSourceQueryArg } = useAppContext();
	const isDesktop = useViewportMatch( 'medium' );
	const [ isSwitcherOpen, setIsSwitcherOpen ] = useState( false );
	const { data: sites } = useQuery( { ...sitesQuery(), enabled: isSwitcherOpen } );
	const [ isAddSiteModalOpen, setIsAddSiteModalOpen ] = useState( false );
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const buildCurrentRouteLink = useBuildCurrentRouteLink();

	if ( ! canManageSite( site ) ) {
		throw notFound();
	}

	return (
		<>
			{ hasStagingSite( site ) && <StagingSiteSyncMonitor site={ site } /> }
			<HeaderBar>
				<HStack justify={ isDesktop ? 'flex-start' : 'space-between' } spacing={ 3 }>
					<HeaderBar.Title>
						<Switcher
							items={ sites }
							value={ site }
							getItemName={ getSiteDisplayName }
							getItemUrl={ ( site ) =>
								buildCurrentRouteLink( { params: { siteSlug: site.slug } } )
							}
							renderItemIcon={ ( { item, size } ) => <SiteIcon site={ item } size={ size } /> }
							open={ isSwitcherOpen }
							onToggle={ setIsSwitcherOpen }
						>
							{ ( { onClose } ) => (
								<MenuGroup>
									<MenuItem
										onClick={ () => {
											onClose();
											setIsAddSiteModalOpen( true );
										} }
									>
										<div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
											<Icon icon={ plus } />
											{ __( 'Add new site' ) }
										</div>
									</MenuItem>
								</MenuGroup>
							) }
						</Switcher>
						{ canSwitchEnvironment( site ) && (
							<>
								<MenuDivider />
								<EnvironmentSwitcher site={ site } />
							</>
						) }
					</HeaderBar.Title>
					{ isAddSiteModalOpen && (
						<Modal
							title={ __( 'Add new site' ) }
							onRequestClose={ () => setIsAddSiteModalOpen( false ) }
						>
							<AddNewSite context={ onboardingLinkSourceQueryArg } />
						</Modal>
					) }
					{ ! isSiteMigrationInProgress( site ) && (
						<>
							{ isDesktop && <MenuDivider /> }
							<SiteMenu site={ site } />
						</>
					) }
				</HStack>
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Site;
