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
import { siteBySlugQuery } from '../../app/queries/site';
import { sitesQuery } from '../../app/queries/sites';
import { siteRoute } from '../../app/router';
import HeaderBar from '../../components/header-bar';
import MenuDivider from '../../components/menu-divider';
import Switcher from '../../components/switcher';
import { getSiteDisplayName } from '../../utils/site-name';
import AddNewSite from '../add-new-site';
import { canManageSite, canSwitchEnvironment } from '../features';
import SiteIcon from '../site-icon';
import SiteMenu from '../site-menu';
import EnvironmentSwitcher from './environment-switcher';

function Site() {
	const isDesktop = useViewportMatch( 'medium' );
	const sites = useQuery( sitesQuery() ).data;
	const [ isModalOpen, setIsModalOpen ] = useState( false );
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
						<Switcher
							items={ sites }
							value={ site }
							getItemName={ getSiteDisplayName }
							getItemUrl={ ( site ) => `/sites/${ site.slug }` }
							renderItemIcon={ ( { item, size } ) => <SiteIcon site={ item } size={ size } /> }
						>
							<MenuGroup>
								<MenuItem onClick={ () => setIsModalOpen( true ) }>
									<div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
										<Icon icon={ plus } />
										{ __( 'Add New Site' ) }
									</div>
								</MenuItem>
							</MenuGroup>
							{ isModalOpen && (
								<Modal
									title={ __( 'Add New Site' ) }
									onRequestClose={ () => setIsModalOpen( false ) }
									className="dashboard-site-switcher__modal"
								>
									<AddNewSite context="sites-dashboard" />
								</Modal>
							) }
						</Switcher>
					</HeaderBar.Title>
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
}

export default Site;
