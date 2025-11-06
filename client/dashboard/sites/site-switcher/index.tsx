import { siteBySlugQuery } from '@automattic/api-queries';
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
import { useAppContext } from '../../app/context';
import useBuildCurrentRouteLink from '../../app/hooks/use-build-current-route-link';
import { siteRoute } from '../../app/router/sites';
import SiteIcon from '../../components/site-icon';
import Switcher from '../../components/switcher';
import { Text } from '../../components/text';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteDisplayUrl } from '../../utils/site-url';
import AddNewSite from '../add-new-site';
import type { Site } from '@automattic/api-core';

const searchableFields = [
	{
		id: 'name',
		getValue: ( { item }: { item: Site } ) => getSiteDisplayName( item ),
	},
	{
		id: 'URL',
		getValue: ( { item }: { item: Site } ) => getSiteDisplayUrl( item ),
	},
];

const SiteSwitcher = () => {
	const { queries } = useAppContext();
	const [ isSwitcherOpen, setIsSwitcherOpen ] = useState( false );
	const { data: sites } = useQuery( { ...queries.sitesQuery(), enabled: isSwitcherOpen } );
	const [ isAddSiteModalOpen, setIsAddSiteModalOpen ] = useState( false );
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const buildCurrentRouteLink = useBuildCurrentRouteLink();

	return (
		<>
			<Switcher< Site >
				items={ sites }
				value={ site }
				searchableFields={ searchableFields }
				getItemUrl={ ( site ) => buildCurrentRouteLink( { params: { siteSlug: site.slug } } ) }
				renderItemMedia={ ( { item, size } ) => <SiteIcon site={ item } size={ size } /> }
				renderItemTitle={ ( { item } ) => (
					<span
						style={ {
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						} }
					>
						{ getSiteDisplayName( item ) }
					</span>
				) }
				renderItemDescription={ ( { item } ) => (
					<Text variant="muted" truncate numberOfLines={ 1 }>
						{ getSiteDisplayUrl( item ) }
					</Text>
				) }
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
