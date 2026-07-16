import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import useBuildCurrentRouteLink from '../../app/hooks/use-build-current-route-link';
import SiteIcon from '../../components/site-icon';
import Switcher from '../../components/switcher';
import { Text } from '../../components/text';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteDisplayUrl } from '../../utils/site-url';
import { canManageSite } from '../features';
import type { SiteSwitcherProps } from './types';
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

export const SiteSwitcherBase = (
	props: Pick< SwitcherProps< Site >, 'children' > & SiteSwitcherProps
) => {
	const { site, ...switcherProps } = props;
	const { recordTracksEvent } = useAnalytics();
	const { queries } = useAppContext();
	const [ isSwitcherOpen, setIsSwitcherOpen ] = useState( false );
	const { data: sites } = useQuery( {
		...queries.sitesQuery( {
			site_visibility: 'visible',
			include_a8c_owned: false,
			include_staging: false,
		} ),
		enabled: isSwitcherOpen,
	} );
	const buildCurrentRouteLink = useBuildCurrentRouteLink();

	return (
		<Switcher< Site >
			{ ...switcherProps }
			renderItem={ ( { item, context } ) => (
				<Switcher.Item
					media={ <SiteIcon site={ item } size={ context === 'list' ? 32 : 16 } /> }
					title={
						<Text weight={ 500 } truncate numberOfLines={ 1 } style={ { color: 'inherit' } }>
							{ getSiteDisplayName( item ) }
						</Text>
					}
					description={
						context === 'list' ? (
							<Text variant="muted" truncate numberOfLines={ 1 }>
								{ getSiteDisplayUrl( item ) }
							</Text>
						) : undefined
					}
				/>
			) }
			items={ sites }
			value={ site }
			searchableFields={ searchableFields }
			headerTitle={ __( 'Switch site' ) }
			getItemUrl={ ( site ) => {
				if ( canManageSite( site ) ) {
					return buildCurrentRouteLink( { params: { siteSlug: site.slug } } );
				}
				return site.options?.admin_url ?? '';
			} }
			open={ isSwitcherOpen }
			onToggle={ ( willOpen: boolean ) => {
				setIsSwitcherOpen( willOpen );
				recordTracksEvent( 'calypso_dashboard_site_switcher_toggle', {
					is_open: willOpen,
				} );
			} }
			onItemClick={ () => {
				recordTracksEvent( 'calypso_dashboard_site_switcher_item_click' );
			} }
		/>
	);
};
