import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronUpDown } from '@wordpress/icons';
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
import { canManageSite } from '../features';
import type { SwitcherProps } from '../../components/switcher';
import type { Site } from '@automattic/api-core';

import './base.scss';

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
	props: Pick< SwitcherProps< Site >, 'children' | 'renderToggle' >
) => {
	const { recordTracksEvent } = useAnalytics();
	const { queries } = useAppContext();
	const [ isSwitcherOpen, setIsSwitcherOpen ] = useState( false );
	const { data: sites } = useQuery( { ...queries.sitesQuery(), enabled: isSwitcherOpen } );
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const buildCurrentRouteLink = useBuildCurrentRouteLink();

	const renderItemMedia: SwitcherProps< Site >[ 'renderItemMedia' ] = ( { item, size } ) => (
		<SiteIcon site={ item } size={ size } />
	);

	const renderItemTitle: SwitcherProps< Site >[ 'renderItemTitle' ] = ( { item } ) => (
		<span
			style={ {
				color: 'var(--dashboard__text-color)',
				fontWeight: 500,
				overflow: 'hidden',
				textOverflow: 'ellipsis',
				whiteSpace: 'nowrap',
			} }
		>
			{ getSiteDisplayName( item ) }
		</span>
	);

	return (
		<HStack className="site-switcher" spacing={ 0 } expanded={ false } style={ { flexShrink: 0 } }>
			<HStack justify="flex-start" alignment="center" style={ { maxWidth: '85%' } }>
				{ renderItemMedia( { item: site, context: 'dropdown', size: 32 } ) }
				<VStack spacing={ 0 }>
					{ renderItemTitle( { item: site, context: 'dropdown' } ) }
					<ExternalLink
						href={ site.URL }
						style={ { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
					>
						{ getSiteDisplayUrl( site ) }
					</ExternalLink>
				</VStack>
			</HStack>
			<Switcher< Site >
				{ ...props }
				items={ sites }
				value={ site }
				searchableFields={ searchableFields }
				getItemUrl={ ( site ) => {
					if ( canManageSite( site ) ) {
						return buildCurrentRouteLink( { params: { siteSlug: site.slug } } );
					}
					return site.options?.admin_url ?? '';
				} }
				renderItemMedia={ renderItemMedia }
				renderItemTitle={ renderItemTitle }
				renderItemDescription={ ( { item } ) => (
					<Text variant="muted" truncate numberOfLines={ 1 }>
						{ getSiteDisplayUrl( item ) }
					</Text>
				) }
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
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						className="site-switcher__toggle"
						variant="tertiary"
						onClick={ onToggle }
						onKeyDown={ ( event: React.KeyboardEvent ) => {
							if ( ! isOpen && event.code === 'ArrowDown' ) {
								event.preventDefault();
								onToggle();
							}
						} }
						aria-haspopup="true"
						aria-expanded={ isOpen }
						label={ __( 'Switch site' ) }
						icon={ chevronUpDown }
						size="small"
					/>
				) }
			/>
		</HStack>
	);
};
