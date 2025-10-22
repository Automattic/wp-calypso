import { siteBySlugQuery, sitesQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { MenuGroup, MenuItem, Icon, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useState } from 'react';
import useBuildCurrentRouteLink from '../../app/hooks/use-build-current-route-link';
import { siteRoute } from '../../app/router/sites';
import SiteIcon from '../../components/site-icon';
import Switcher from '../../components/switcher';
import { getSiteDisplayName } from '../../utils/site-name';
import AddNewSite from '../add-new-site';

const SiteSwitcher = () => {
	const [ isSwitcherOpen, setIsSwitcherOpen ] = useState( false );
	const { data: sites } = useQuery( { ...sitesQuery(), enabled: isSwitcherOpen } );
	const [ isAddSiteModalOpen, setIsAddSiteModalOpen ] = useState( false );
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const buildCurrentRouteLink = useBuildCurrentRouteLink();

	return (
		<>
			<Switcher
				items={ sites }
				value={ site }
				getItemName={ getSiteDisplayName }
				getItemUrl={ ( site ) => buildCurrentRouteLink( { params: { siteSlug: site.slug } } ) }
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
			{ isAddSiteModalOpen && (
				<Modal
					title={ __( 'Add new site' ) }
					onRequestClose={ () => setIsAddSiteModalOpen( false ) }
				>
					<AddNewSite context="sites-dashboard" />
				</Modal>
			) }
		</>
	);
};

export default SiteSwitcher;
