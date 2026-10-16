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
	__experimentalHeading as Heading,
	ToggleControl,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Fragment } from 'react';
import { useMcpTracksAudienceProps } from '../../../me/mcp/tracks';
import {
	getRemoteAbilityCategory,
	getRemoteAbilityGroupKey,
	getSiteRemoteGroups,
} from '../../../me/mcp/utils';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { Card, CardBody, CardDivider } from '../../components/card';
import Notice from '../../components/notice';
import { SectionHeader } from '../../components/section-header';
import type { Site, SiteAbility } from '@automattic/api-core';

export type RemoteAbilityCategory = 'read' | 'write';

type NamespaceGroup = {
	keys: string[];
	abilities: SiteAbility[];
};

/** jetpack-forms -> Jetpack Forms (display only; stored keys keep the raw namespace). */
function formatNamespace( namespace: string ): string {
	return namespace
		.split( '-' )
		.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
		.join( ' ' );
}

/**
 * What one access-level page offers, keyed by namespace: the group keys its
 * toggle writes, and the abilities listed so the owner can see what the group
 * covers. Saved groups always render: their state lives on WordPress.com, so
 * it survives an unreachable site or an unpublished ability.
 */
function collectNamespaces(
	abilities: SiteAbility[] | undefined,
	savedGroups: Record< string, boolean >,
	category: RemoteAbilityCategory
): Map< string, NamespaceGroup > {
	const namespaces = new Map< string, NamespaceGroup >();
	const entry = ( namespace: string ): NamespaceGroup => {
		const group = namespaces.get( namespace ) ?? { keys: [], abilities: [] };
		namespaces.set( namespace, group );
		return group;
	};
	const addKey = ( group: NamespaceGroup, groupKey: string ) => {
		if ( ! group.keys.includes( groupKey ) ) {
			group.keys.push( groupKey );
		}
	};

	( abilities ?? [] ).forEach( ( ability ) => {
		if ( getRemoteAbilityCategory( ability.name, ability.meta?.annotations ) !== category ) {
			return;
		}
		const groupKey = getRemoteAbilityGroupKey( ability.name, ability.meta?.annotations );
		const namespace = groupKey.split( ':' )[ 1 ];
		const group = entry( namespace );
		addKey( group, groupKey );
		group.abilities.push( ability );
	} );

	Object.keys( savedGroups ).forEach( ( groupKey ) => {
		const [ kind, namespace ] = groupKey.split( ':' );
		if ( ! namespace ) {
			return;
		}
		if ( ( kind === 'read' ? 'read' : 'write' ) !== category ) {
			return;
		}
		addKey( entry( namespace ), groupKey );
	} );

	return new Map( [ ...namespaces.entries() ].sort( ( [ a ], [ b ] ) => a.localeCompare( b ) ) );
}

export default function RemoteAbilitiesCard( {
	site,
	category,
}: {
	site: Site;
	category: RemoteAbilityCategory;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const tracksAudienceProps = useMcpTracksAudienceProps();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const { data: abilities, isLoading, isError } = useQuery( siteAbilitiesQuery( site.ID ) );

	const savedGroups = getSiteRemoteGroups( userSettings || {}, site.ID );
	const namespaces = collectNamespaces( abilities, savedGroups, category );

	const mutation = useMutation(
		withSnackbar( userSettingsMutation(), {
			success: __( 'MCP settings saved.' ),
			error: __( 'Failed to save MCP settings.' ),
		} )
	);

	if ( ! site.jetpack || ( namespaces.size === 0 && ! isLoading ) ) {
		return null;
	}

	const saveGroups = ( keys: string[], enabled: boolean, tracksGroup: string ) => {
		mutation.mutate(
			{
				mcp_abilities: {
					sites: [
						{
							blog_id: site.ID,
							remote_groups: Object.fromEntries( keys.map( ( key ) => [ key, enabled ] ) ),
						},
					],
				},
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_mcp_remote_group_toggled', {
						...tracksAudienceProps,
						group: tracksGroup,
						enabled,
						site_id: site.ID,
					} );
				},
			}
		);
	};

	const allKeys = [ ...namespaces.values() ].flatMap( ( group ) => group.keys );
	const allEnabled = allKeys.length > 0 && allKeys.every( ( key ) => savedGroups[ key ] === true );

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						title={ __( 'Site-published abilities' ) }
						description={ __(
							'Advanced: choose which abilities published by this site’s plugins an external AI agent may use. Groups are off unless enabled here.'
						) }
						level={ 3 }
						actions={
							namespaces.size > 0 ? (
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ allEnabled }
									disabled={ mutation.isPending }
									label={ __( 'Enable all' ) }
									onChange={ ( checked ) => saveGroups( allKeys, checked, 'all' ) }
								/>
							) : undefined
						}
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
			{ [ ...namespaces.entries() ].map( ( [ namespace, group ] ) => {
				const namespaceEnabled =
					group.keys.length > 0 && group.keys.every( ( key ) => savedGroups[ key ] === true );
				return (
					<Fragment key={ namespace }>
						<CardDivider className="mcp-settings__sub-divider" />
						<CardBody>
							<VStack spacing={ 4 }>
								<HStack justify="space-between" alignment="center">
									<Heading level={ 4 } weight={ 600 } size={ 14 }>
										{ formatNamespace( namespace ) }
									</Heading>
									<ToggleControl
										__nextHasNoMarginBottom
										checked={ namespaceEnabled }
										disabled={ mutation.isPending }
										label={ __( 'Enable all' ) }
										onChange={ ( checked ) =>
											saveGroups( group.keys, checked, `${ category }:${ namespace }` )
										}
									/>
								</HStack>
								{ group.abilities.length > 0 && (
									<VStack spacing={ 3 }>
										{ group.abilities.map( ( ability ) => (
											<VStack key={ ability.name } spacing={ 1 }>
												<Text as="p" weight={ 500 }>
													{ ability.label || ability.name }
												</Text>
												{ ability.description && (
													<Text as="p" variant="muted" size={ 13 }>
														{ ability.description }
													</Text>
												) }
											</VStack>
										) ) }
									</VStack>
								) }
							</VStack>
						</CardBody>
					</Fragment>
				);
			} ) }
		</Card>
	);
}
