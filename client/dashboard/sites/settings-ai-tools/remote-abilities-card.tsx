import {
	userSettingsMutation,
	userSettingsQuery,
	siteAbilitiesQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery, useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	ToggleControl,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Fragment } from 'react';
import { useMcpTracksAudienceProps } from '../../../me/mcp/tracks';
import { getRemoteAbilityGroupKey, getSiteRemoteGroups } from '../../../me/mcp/utils';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { Card, CardBody, CardDivider } from '../../components/card';
import Notice from '../../components/notice';
import { SectionHeader } from '../../components/section-header';
import type { Site, SiteAbility } from '@automattic/api-core';

const GROUP_CATEGORIES = [ 'read', 'write', 'destructive' ] as const;
type GroupCategory = ( typeof GROUP_CATEGORIES )[ number ];

const CATEGORY_LABELS: Record< GroupCategory, string > = {
	read: __( 'Read' ),
	write: __( 'Write' ),
	destructive: __( 'Destructive' ),
};

/**
 * The namespaces and group categories to offer, from the site's published
 * catalog unioned with the saved allowlist. Saved groups always render:
 * their state lives on WordPress.com, so it survives an unreachable site or
 * an unpublished ability.
 */
function collectGroups(
	abilities: SiteAbility[] | undefined,
	savedGroups: Record< string, boolean >
): Map< string, Set< GroupCategory > > {
	const namespaces = new Map< string, Set< GroupCategory > >();
	const add = ( groupKey: string ) => {
		const [ category, namespace ] = groupKey.split( ':' );
		if ( ! namespace || ! GROUP_CATEGORIES.includes( category as GroupCategory ) ) {
			return;
		}
		const categories = namespaces.get( namespace ) ?? new Set< GroupCategory >();
		categories.add( category as GroupCategory );
		namespaces.set( namespace, categories );
	};

	( abilities ?? [] ).forEach( ( ability ) => {
		add( getRemoteAbilityGroupKey( ability.name, ability.meta?.annotations ) );
	} );
	Object.keys( savedGroups ).forEach( add );

	return new Map( [ ...namespaces.entries() ].sort( ( [ a ], [ b ] ) => a.localeCompare( b ) ) );
}

export default function RemoteAbilitiesCard( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();
	const tracksAudienceProps = useMcpTracksAudienceProps();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const { data: abilities, isLoading, isError } = useQuery( siteAbilitiesQuery( site.ID ) );

	const savedGroups = getSiteRemoteGroups( userSettings || {}, site.ID );
	const namespaces = collectGroups( abilities, savedGroups );

	const mutation = useMutation(
		withSnackbar( userSettingsMutation(), {
			success: __( 'MCP settings saved.' ),
			error: __( 'Failed to save MCP settings.' ),
		} )
	);

	// The site publishes nothing and nothing was ever saved: no section to show.
	// An unreachable site with nothing saved is the same — nothing to manage.
	if ( namespaces.size === 0 && ! isLoading ) {
		return null;
	}

	const handleGroupToggle = ( groupKey: string, enabled: boolean ) => {
		mutation.mutate(
			{
				mcp_abilities: {
					sites: [
						{
							blog_id: site.ID,
							remote_groups: { [ groupKey ]: enabled },
						},
					],
				},
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_mcp_remote_group_toggled', {
						...tracksAudienceProps,
						group: groupKey,
						enabled,
						site_id: site.ID,
					} );
				},
			}
		);
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						title={ __( 'Site-published abilities' ) }
						description={ __(
							'Advanced: choose which abilities published by this site’s plugins an external AI agent may use, grouped by plugin and access level. Groups are off unless enabled here.'
						) }
						level={ 3 }
					/>
					{ isLoading && namespaces.size === 0 && <Spinner /> }
					{ isError && (
						<Notice density="medium">
							{ __(
								'This site’s abilities can’t be loaded right now. The site may be unreachable or too old to publish them. Your saved settings are shown and still apply.'
							) }
						</Notice>
					) }
				</VStack>
			</CardBody>
			{ [ ...namespaces.entries() ].map( ( [ namespace, categories ] ) => (
				<Fragment key={ namespace }>
					<CardDivider className="mcp-settings__sub-divider" />
					<CardBody>
						<VStack spacing={ 3 }>
							<Text as="h4" weight={ 600 } size={ 14 }>
								{ namespace }
							</Text>
							<HStack spacing={ 6 } justify="flex-start" wrap>
								{ GROUP_CATEGORIES.filter( ( category ) => categories.has( category ) ).map(
									( category ) => {
										const groupKey = `${ category }:${ namespace }`;
										return (
											<ToggleControl
												key={ groupKey }
												__nextHasNoMarginBottom
												checked={ savedGroups[ groupKey ] === true }
												disabled={ mutation.isPending }
												label={ CATEGORY_LABELS[ category ] }
												onChange={ ( checked ) => handleGroupToggle( groupKey, checked ) }
											/>
										);
									}
								) }
							</HStack>
						</VStack>
					</CardBody>
				</Fragment>
			) ) }
		</Card>
	);
}
