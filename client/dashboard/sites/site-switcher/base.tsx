import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAppContext } from '../../app/context';
import useBuildCurrentRouteLink from '../../app/hooks/use-build-current-route-link';
import { siteRoute } from '../../app/router/sites';
import SiteIcon from '../../components/site-icon';
import Switcher from '../../components/switcher';
import { Text } from '../../components/text';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteDisplayUrl } from '../../utils/site-url';
import type { SwitcherProps } from '../../components/switcher';
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

export const SiteSwitcherBase = ( props: Pick< SwitcherProps< Site >, 'children' > ) => {
	const { queries } = useAppContext();
	const [ isSwitcherOpen, setIsSwitcherOpen ] = useState( false );
	const { data: sites } = useQuery( { ...queries.sitesQuery(), enabled: isSwitcherOpen } );
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const buildCurrentRouteLink = useBuildCurrentRouteLink();

	return (
		<Switcher< Site >
			{ ...props }
			items={ sites }
			value={ site }
			searchableFields={ searchableFields }
			getItemUrl={ ( site ) => buildCurrentRouteLink( { params: { siteSlug: site.slug } } ) }
			renderItemMedia={ ( { item, size } ) => <SiteIcon site={ item } size={ size } /> }
			renderItemTitle={ ( { item } ) => (
				<span
					style={ {
						fontWeight: 500,
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
		/>
	);
};
