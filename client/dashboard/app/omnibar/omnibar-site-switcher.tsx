import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	Dropdown,
	Icon,
	MenuGroup,
	MenuItem,
	Modal,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useState } from 'react';
import SiteIcon from '../../components/site-icon';
import Switcher from '../../components/switcher';
import SwitcherContent from '../../components/switcher/switcher-content';
import { Text } from '../../components/text';
import AddNewSite from '../../sites/add-new-site';
import { canManageSite } from '../../sites/features';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteDisplayUrl } from '../../utils/site-url';
import { useAnalytics } from '../analytics';
import { useAppContext } from '../context';
import useBuildCurrentRouteLink from '../hooks/use-build-current-route-link';
import { useOmnibarEvent } from './events';
import type { Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

const DEFAULT_VIEW: View = {
	type: 'list',
	page: 1,
	perPage: 10,
	sort: { field: 'name', direction: 'asc' },
};

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

export default function OmnibarSiteSwitcher() {
	const { recordTracksEvent } = useAnalytics();
	const { queries } = useAppContext();
	const buildCurrentRouteLink = useBuildCurrentRouteLink();

	const [ isOpen, setIsOpen ] = useState( false );
	const [ anchor, setAnchor ] = useState< HTMLElement | null >( null );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const [ isAddSiteModalOpen, setIsAddSiteModalOpen ] = useState( false );

	useOmnibarEvent( 'siteSwitcher', () => {
		setIsOpen( ( prev ) => {
			const next = ! prev;
			recordTracksEvent( 'calypso_dashboard_omnibar_site_switcher_toggle', {
				is_open: next,
			} );
			return next;
		} );
	} );
	useOmnibarEvent( 'siteSwitcherAnchor', setAnchor );

	const { data: sites } = useQuery( {
		...queries.sitesQuery( {
			site_visibility: 'visible',
			include_a8c_owned: false,
			include_staging: false,
		} ),
		enabled: isOpen,
	} );

	return (
		<>
			<Dropdown
				open={ isOpen }
				onToggle={ setIsOpen }
				popoverProps={ {
					placement: 'bottom-start',
					offset: 4,
					...( anchor && { anchor } ),
					onFocusOutside: () => {
						// When focus moves to the omnibar (e.g. clicking the chevron
						// again), suppress the Popover's auto-close and let the omnibar
						// event handle the toggle instead. Otherwise the focus-outside
						// close races with the omnibar's toggle event, causing the panel
						// to close then immediately reopen.
						const omnibar = document.getElementById( 'wpcom-omnibar' );
						if ( omnibar?.contains( document.activeElement ) ) {
							return;
						}
						setIsOpen( false );
					},
				} }
				renderToggle={ () => null }
				renderContent={ ( { onClose } ) => (
					<SwitcherContent< Site >
						items={ sites }
						searchableFields={ searchableFields }
						view={ view }
						onChangeView={ setView }
						getItemUrl={ ( site ) => {
							if ( canManageSite( site ) ) {
								return buildCurrentRouteLink( { params: { siteSlug: site.slug } } );
							}
							return site.options?.admin_url ?? '';
						} }
						renderItem={ ( { item } ) => (
							<Switcher.Item
								media={ <SiteIcon site={ item } size={ 32 } /> }
								title={
									<Text weight={ 500 } truncate numberOfLines={ 1 } style={ { color: 'inherit' } }>
										{ getSiteDisplayName( item ) }
									</Text>
								}
								description={
									<Text variant="muted" truncate numberOfLines={ 1 }>
										{ getSiteDisplayUrl( item ) }
									</Text>
								}
							/>
						) }
						onClose={ onClose }
						onItemClick={ () =>
							recordTracksEvent( 'calypso_dashboard_omnibar_site_switcher_item_click' )
						}
					>
						<MenuGroup>
							<MenuItem
								onClick={ () => {
									recordTracksEvent( 'calypso_dashboard_omnibar_site_switcher_add_new_site_click' );
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
					</SwitcherContent>
				) }
			/>
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
}
