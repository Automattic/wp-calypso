import { siteBySlugQuery, sitesQuery, isDeletingStagingSiteQuery } from '@automattic/api-queries';
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
import { siteRoute } from '../../app/router/sites';
import StagingSiteSyncMonitor from '../../app/staging-site-sync-monitor';
import { CalloutOverlay } from '../../components/callout-overlay';
import HeaderBar from '../../components/header-bar';
import MenuDivider from '../../components/menu-divider';
import Switcher from '../../components/switcher';
import { getSiteDisplayName } from '../../utils/site-name';
import { hasStagingSite } from '../../utils/site-staging-site';
import AddNewSite from '../add-new-site';
import { canManageSite, canSwitchEnvironment } from '../features';
import SiteIcon from '../site-icon';
import SiteMenu from '../site-menu';
import { StagingSiteDeletionCallout } from '../staging-site-deletion-callout';
import EnvironmentSwitcher from './environment-switcher';

function Site() {
	const isDesktop = useViewportMatch( 'medium' );
	const sites = useQuery( sitesQuery() ).data;
	const [ isAddSiteModalOpen, setIsAddSiteModalOpen ] = useState( false );
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const { data: isStagingSiteDeletionInProgress } = useQuery( {
		...isDeletingStagingSiteQuery( site.ID ),
		enabled: !! site.ID,
	} );

	if ( ! canManageSite( site ) ) {
		throw notFound();
	}

	const siteContent = (
		<>
			{ hasStagingSite( site ) && <StagingSiteSyncMonitor site={ site } /> }
			<HeaderBar>
				<HStack justify={ isDesktop ? 'flex-start' : 'space-between' } spacing={ 3 }>
					<HeaderBar.Title>
						<Switcher
							items={ sites }
							value={ site }
							getItemName={ getSiteDisplayName }
							getItemUrl={ ( site ) => `/sites/${ site.slug }` }
							renderItemIcon={ ( { item, size } ) => <SiteIcon site={ item } size={ size } /> }
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
					</HeaderBar.Title>
					{ isAddSiteModalOpen && (
						<Modal
							title={ __( 'Add new site' ) }
							onRequestClose={ () => setIsAddSiteModalOpen( false ) }
						>
							<AddNewSite context="sites-dashboard" />
						</Modal>
					) }
					{ canSwitchEnvironment( site ) && (
						<>
							<MenuDivider />
							<EnvironmentSwitcher site={ site } />
						</>
					) }
					{ isDesktop && <MenuDivider /> }
					<SiteMenu site={ site } />
				</HStack>
			</HeaderBar>
			<Outlet />
		</>
	);

	//const isStagingSiteDeletionInProgressX = true;

	return (
		<CalloutOverlay
			showCallout={ !! isStagingSiteDeletionInProgress && site.is_wpcom_staging_site }
			callout={ <StagingSiteDeletionCallout site={ site } /> }
			main={ siteContent }
		/>
	);
}

export default Site;
