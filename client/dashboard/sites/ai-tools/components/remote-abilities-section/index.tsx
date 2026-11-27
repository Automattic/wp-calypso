import {
	userSettingsMutation,
	userSettingsQuery,
	siteAbilitiesQuery,
} from '@automattic/api-queries';
import languages from '@automattic/languages';
import { useFuzzySearch } from '@automattic/search';
import { useMutation, useSuspenseQuery, useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getMcpBulkHelp, McpToolToggle } from '../../../../../me/mcp/opt-in-controls';
import { useMcpTracksAudienceProps } from '../../../../../me/mcp/tracks';
import {
	getRemoteAbilityCategory,
	getRemoteAbilityGroupKey,
	getRemoteAbilityKey,
	getSiteRemoteGroups,
	isRemoteAbilityEnabled,
	isRemoteAbilityOptIn,
	isRemoteKeyEnabled,
} from '../../../../../me/mcp/utils';
import { useAnalytics } from '../../../../app/analytics';
import { useLocale } from '../../../../app/locale';
import { withSnackbar } from '../../../../app/snackbars/with-snackbar';
import AnchorCopyButton from '../../../../components/anchor-copy-button';
import Notice from '../../../../components/notice';
import { SectionHeader } from '../../../../components/section-header';
import McpGroupCard from '../mcp-group-card';
import type { Site, SiteAbility } from '@automattic/api-core';

export type RemoteAbilityCategory = 'read' | 'write';

type NamespaceGroup = {
	/** Group-level keys ("{read|write|destructive}:{namespace}"). */
	keys: string[];
	/** Ability-level keys from the saved allowlist ("{group}/{ability}"). */
	abilityKeys: string[];
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
 * card intent writes, and the abilities listed under it. Saved groups always
 * render: their state lives on WordPress.com, so it survives an unreachable
 * site or an unpublished ability.
 */
export function collectNamespaces(
	abilities: SiteAbility[] | undefined,
	savedGroups: Record< string, boolean >,
	category: RemoteAbilityCategory
): Map< string, NamespaceGroup > {
	const namespaces = new Map< string, NamespaceGroup >();
	const entry = ( namespace: string ): NamespaceGroup => {
		const group = namespaces.get( namespace ) ?? { keys: [], abilityKeys: [], abilities: [] };
		namespaces.set( namespace, group );
		return group;
	};
	const addKey = ( keys: string[], groupKey: string ) => {
		if ( ! keys.includes( groupKey ) ) {
			keys.push( groupKey );
		}
	};

	( abilities ?? [] ).forEach( ( ability ) => {
		if ( getRemoteAbilityCategory( ability.name, ability.meta?.annotations ) !== category ) {
			return;
		}
		const groupKey = getRemoteAbilityGroupKey( ability.name, ability.meta?.annotations );
		const namespace = groupKey.split( ':' )[ 1 ];
		const group = entry( namespace );
		addKey( group.keys, groupKey );
		group.abilities.push( ability );
	} );

	Object.keys( savedGroups ).forEach( ( groupKey ) => {
		const [ kind, rest ] = groupKey.split( ':' );
		if ( ! rest ) {
			return;
		}
		if ( ( kind === 'read' ? 'read' : 'write' ) !== category ) {
			return;
		}
		const [ namespace, abilityPath ] = rest.split( '/' );
		addKey( abilityPath ? entry( namespace ).abilityKeys : entry( namespace ).keys, groupKey );
	} );

	return new Map( [ ...namespaces.entries() ].sort( ( [ a ], [ b ] ) => a.localeCompare( b ) ) );
}

export function getRemoteBulkKeys( group: NamespaceGroup, remoteOptIn?: string[] ): string[] {
	const individualKeys = group.abilityKeys.filter(
		( key ) => ! isRemoteAbilityOptIn( key.split( ':' )[ 1 ], remoteOptIn )
	);
	const hasOnlyOptInAbilities =
		group.abilities.length > 0 &&
		group.abilities.every( ( ability ) => isRemoteAbilityOptIn( ability.name, remoteOptIn ) );
	return hasOnlyOptInAbilities && individualKeys.length === 0
		? []
		: [ ...group.keys, ...individualKeys ];
}

export function isRemoteBulkEnabled(
	group: NamespaceGroup,
	savedGroups: Record< string, boolean >,
	defaultEnabled: boolean,
	remoteOptIn?: string[]
): boolean {
	return (
		getRemoteBulkKeys( group, remoteOptIn ).every( ( key ) =>
			isRemoteKeyEnabled( savedGroups, key, defaultEnabled )
		) &&
		group.abilities.every(
			( ability ) =>
				isRemoteAbilityOptIn( ability.name, remoteOptIn ) ||
				isRemoteAbilityEnabled(
					savedGroups,
					ability.name,
					ability.meta?.annotations,
					defaultEnabled
				)
		)
	);
}

export default function RemoteAbilitiesSection( {
	site,
	category,
	search = '',
	defaultEnabled = false,
}: {
	site: Site;
	category: RemoteAbilityCategory;
	search?: string;
	/** State of abilities with no saved choice: follows the user's MCP access for this category. */
	defaultEnabled?: boolean;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const tracksAudienceProps = useMcpTracksAudienceProps();
	const localeSlug = useLocale();
	const wpLocale = languages.find( ( { langSlug } ) => langSlug === localeSlug )?.wpLocale;
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const {
		data: abilities,
		isLoading,
		isError,
	} = useQuery( {
		...siteAbilitiesQuery( site.ID, wpLocale || undefined ),
		enabled: !! site.jetpack,
	} );

	const savedGroups = getSiteRemoteGroups( userSettings || {}, site.ID );
	const remoteOptIn = userSettings?.mcp_abilities?.remote_abilities_requiring_opt_in;
	const query = search.trim();
	const filteredAbilities = useFuzzySearch( {
		data: abilities ?? [],
		keys: [ 'label', 'description', 'name' ],
		query,
	} );
	const namespaces = collectNamespaces( filteredAbilities, savedGroups, category );
	if ( query ) {
		// A saved-only card (no catalog abilities to match against) stays only
		// when its own name matches the query.
		[ ...namespaces.keys() ].forEach( ( namespace ) => {
			const group = namespaces.get( namespace ) as NamespaceGroup;
			const textMatch =
				namespace.toLowerCase().includes( query.toLowerCase() ) ||
				formatNamespace( namespace ).toLowerCase().includes( query.toLowerCase() );
			if ( group.abilities.length === 0 && ! textMatch ) {
				namespaces.delete( namespace );
			}
		} );
	}

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

	return (
		<>
			<VStack spacing={ 2 }>
				<SectionHeader
					title={ __( 'Site-published abilities' ) }
					description={ __(
						'Choose which abilities this site’s plugins publish to external AI agents.'
					) }
					level={ 3 }
				/>
				{ isLoading && namespaces.size === 0 && <Spinner /> }
				{ isError && (
					<Notice>
						{ __(
							'This site’s abilities can’t be loaded right now. The site may be unreachable or too old to publish them. Your saved settings are shown and still apply.'
						) }
					</Notice>
				) }
			</VStack>
			{ [ ...namespaces.entries() ].map( ( [ namespace, group ] ) => {
				const intentKeys = getRemoteBulkKeys( group, remoteOptIn );
				const optInCount = group.abilities.filter( ( ability ) =>
					isRemoteAbilityOptIn( ability.name, remoteOptIn )
				).length;
				return (
					<McpGroupCard
						key={ namespace }
						id={ namespace }
						title={ formatNamespace( namespace ) }
						toolAnchors={ group.abilities.map( ( ability ) => ability.name ) }
						allEnabled={ isRemoteBulkEnabled( group, savedGroups, defaultEnabled, remoteOptIn ) }
						enableAllHelp={ getMcpBulkHelp( optInCount ) }
						disabled={ mutation.isPending }
						forceOpen={ query.length > 0 }
						onEnableAll={
							intentKeys.length > 0
								? ( checked ) => saveGroups( intentKeys, checked, `${ category }:${ namespace }` )
								: undefined
						}
					>
						{ group.abilities.length > 0 ? (
							<VStack spacing={ 4 }>
								{ group.abilities.map( ( ability ) => {
									const abilityKey = getRemoteAbilityKey( ability.name, ability.meta?.annotations );
									return (
										<div key={ ability.name } id={ ability.name }>
											<HStack justify="space-between" alignment="flex-start" spacing={ 2 }>
												<div style={ { flex: 1, minWidth: 0 } }>
													<McpToolToggle
														tool={ {
															title: ability.label || ability.name,
															description: ability.description ?? '',
															enabled: isRemoteAbilityEnabled(
																savedGroups,
																ability.name,
																ability.meta?.annotations,
																defaultEnabled,
																remoteOptIn
															),
															requires_opt_in: isRemoteAbilityOptIn( ability.name, remoteOptIn ),
														} }
														disabled={ mutation.isPending }
														onChange={ ( checked ) =>
															saveGroups( [ abilityKey ], checked, abilityKey )
														}
													/>
												</div>
												<AnchorCopyButton anchor={ ability.name } />
											</HStack>
										</div>
									);
								} ) }
							</VStack>
						) : undefined }
					</McpGroupCard>
				);
			} ) }
		</>
	);
}
