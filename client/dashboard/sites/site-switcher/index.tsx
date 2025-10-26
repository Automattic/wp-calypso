import { siteBySlugQuery, sitesQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	MenuGroup,
	MenuItem,
	Icon,
	Modal,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useState } from 'react';
import useBuildCurrentRouteLink from '../../app/hooks/use-build-current-route-link';
import { siteRoute } from '../../app/router/sites';
import SiteIcon from '../../components/site-icon';
import Switcher from '../../components/switcher';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteDisplayUrl } from '../../utils/site-url';
import AddNewSite from '../add-new-site';
import type { Site } from '@automattic/api-core';

const searchableFields = [
	{
		id: 'URL',
		getValue: ( { item }: { item: Site } ) => getSiteDisplayUrl( item ),
	},
];

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
				searchableFields={ searchableFields }
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
							<HStack justify="flex-start" alignment="center">
								<Icon icon={ plus } />
								<span>{ __( 'Add new site' ) }</span>
							</HStack>
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
