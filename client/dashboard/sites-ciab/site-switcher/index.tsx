import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack, MenuGroup, MenuItem, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import useBuildCurrentRouteLink from '../../app/hooks/use-build-current-route-link';
import { siteRoute } from '../../app/router/sites';
import SiteIcon from '../../components/site-icon';
import Switcher from '../../components/switcher';
import { Text } from '../../components/text';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteDisplayUrl } from '../../utils/site-url';
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

const CIABSiteSwitcher = () => {
	const { recordTracksEvent } = useAnalytics();
	const { queries } = useAppContext();
	const [ isSwitcherOpen, setIsSwitcherOpen ] = useState( false );
	const { data: sites } = useQuery( {
		...queries.sitesQuery( {
			site_visibility: 'visible',
			include_a8c_owned: false,
		} ),
		enabled: isSwitcherOpen,
	} );
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const buildCurrentRouteLink = useBuildCurrentRouteLink();
	const handleAddNewStore = () => {
		recordTracksEvent( 'calypso_dashboard_site_switcher_new_site_button_click', {
			action: 'big-sky',
			context: 'ciab-sites-dashboard',
		} );

		const addNewStoreUrl = addQueryArgs( '/setup/ai-site-builder-spec', {
			source: 'ciab-sites-dashboard',
			ref: 'new-site-popover',
		} );

		window.location.href = addNewStoreUrl;
	};

	return (
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
			{ () => (
				<MenuGroup>
					<MenuItem onClick={ handleAddNewStore }>
						<HStack justify="flex-start" alignment="center">
							<Icon icon={ plus } />
							<span>{ __( 'Add new store', 'Commerce in a box' ) }</span>
						</HStack>
					</MenuItem>
				</MenuGroup>
			) }
		</Switcher>
	);
};

export default CIABSiteSwitcher;
