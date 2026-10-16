import {
	userSettingsMutation,
	userSettingsQuery,
	siteAbilitiesQuery,
} from '@automattic/api-queries';
import languages from '@automattic/languages';
import { useMutation, useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ToggleControl, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMcpTracksAudienceProps } from '../../../me/mcp/tracks';
import {
	getRemoteAbilityCategory,
	getRemoteAbilityGroupKey,
	getSiteRemoteGroups,
} from '../../../me/mcp/utils';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import Notice from '../../components/notice';
import { SectionHeader } from '../../components/section-header';
import McpGroupCard from './mcp-group-card';
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

export default function RemoteAbilitiesSection( {
	site,
	category,
}: {
	site: Site;
	category: RemoteAbilityCategory;
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
	} = useQuery( siteAbilitiesQuery( site.ID, wpLocale || undefined ) );

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

	return (
		<>
			<VStack spacing={ 2 }>
				<SectionHeader
					title={ __( 'Site-published abilities' ) }
					description={ __(
						'Advanced: choose which abilities published by this site’s plugins an external AI agent may use. All are off unless enabled here.'
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
					group.keys.length > 0 && group.keys.every( ( key ) => savedGroups[ key ] === true );
				return (
					<McpGroupCard
						key={ namespace }
						id={ namespace }
						title={ formatNamespace( namespace ) }
						toolAnchors={ group.abilities.map( ( ability ) => ability.name ) }
						allEnabled={ namespaceEnabled }
						disabled={ mutation.isPending }
						onEnableAll={ ( checked ) =>
							saveGroups( group.keys, checked, `${ category }:${ namespace }` )
						}
					>
						{ group.abilities.length > 0 ? (
							<VStack spacing={ 4 }>
								{ group.abilities.map( ( ability ) => {
									const groupKey = getRemoteAbilityGroupKey(
										ability.name,
										ability.meta?.annotations
									);
									return (
										<div key={ ability.name } id={ ability.name }>
											<ToggleControl
												__nextHasNoMarginBottom
												checked={ savedGroups[ groupKey ] === true }
												disabled={ mutation.isPending }
												label={ ability.label || ability.name }
												help={ ability.description }
												onChange={ ( checked ) => saveGroups( [ groupKey ], checked, groupKey ) }
											/>
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
