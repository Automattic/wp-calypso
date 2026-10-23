import {
	isAutomatticianQuery,
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
	ToggleControl,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMcpTracksAudienceProps } from '../../../me/mcp/tracks';
import {
	getRemoteAbilityCategory,
	getRemoteAbilityGroupKey,
	getRemoteAbilityKey,
	getSiteRemoteGroups,
	isRemoteAbilityEnabled,
	isRemoteKeyEnabled,
} from '../../../me/mcp/utils';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import AnchorCopyButton from '../../components/anchor-copy-button';
import Notice from '../../components/notice';
import { SectionHeader } from '../../components/section-header';
import McpGroupCard from './mcp-group-card';
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
	// Staff-gated like the server-side remote: path (AI-1328); drop this gate at GA.
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const {
		data: abilities,
		isLoading,
		isError,
	} = useQuery( {
		...siteAbilitiesQuery( site.ID, wpLocale || undefined ),
		enabled: !! isAutomattician,
	} );

	const savedGroups = getSiteRemoteGroups( userSettings || {}, site.ID );
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

	if ( ! isAutomattician || ! site.jetpack || ( namespaces.size === 0 && ! isLoading ) ) {
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
					<Notice density="medium">
						{ __(
							'This site’s abilities can’t be loaded right now. The site may be unreachable or too old to publish them. Your saved settings are shown and still apply.'
						) }
					</Notice>
				) }
			</VStack>
			{ [ ...namespaces.entries() ].map( ( [ namespace, group ] ) => {
				const namespaceEnabled =
					group.keys.length > 0 &&
					group.keys.every( ( key ) => isRemoteKeyEnabled( savedGroups, key, defaultEnabled ) ) &&
					group.abilityKeys.every( ( key ) =>
						isRemoteKeyEnabled( savedGroups, key, defaultEnabled )
					) &&
					group.abilities.every( ( ability ) =>
						isRemoteAbilityEnabled(
							savedGroups,
							ability.name,
							ability.meta?.annotations,
							defaultEnabled
						)
					);
				// Both directions write the group keys and any saved ability-level
				// keys: enabling overwrites stale denies, and disabling clears
				// ability-level trues too — those actively allow, so leaving them
				// would keep the abilities on.
				const intentKeys = [ ...group.keys, ...group.abilityKeys ];
				return (
					<McpGroupCard
						key={ namespace }
						id={ namespace }
						title={ formatNamespace( namespace ) }
						toolAnchors={ group.abilities.map( ( ability ) => ability.name ) }
						allEnabled={ namespaceEnabled }
						disabled={ mutation.isPending }
						forceOpen={ query.length > 0 }
						onEnableAll={ ( checked ) =>
							saveGroups( intentKeys, checked, `${ category }:${ namespace }` )
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
													<ToggleControl
														__nextHasNoMarginBottom
														checked={ isRemoteAbilityEnabled(
															savedGroups,
															ability.name,
															ability.meta?.annotations,
															defaultEnabled
														) }
														disabled={ mutation.isPending }
														label={ ability.label || ability.name }
														help={ ability.description }
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
