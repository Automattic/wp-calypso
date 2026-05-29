import {
	ToggleControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useFetchMcpSettings from 'calypso/a8c-for-agencies/data/mcp-ai/use-fetch-mcp-settings';
import useSaveMcpSettings from 'calypso/a8c-for-agencies/data/mcp-ai/use-save-mcp-settings';
import { Card, CardBody, CardDivider } from 'calypso/dashboard/components/card';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type {
	McpAvailableAbility,
	McpAvailableCategory,
} from 'calypso/a8c-for-agencies/data/mcp-ai/types';

import '../style.scss';

/**
 * Slug used to bucket any ability the backend returned without a category
 * (or with a category slug not present in `available_categories`). Renders
 * under an "Other" heading at the end so nothing silently disappears from
 * the UI if the backend and frontend drift.
 */
const UNCATEGORIZED_SLUG = '__uncategorized__';

interface CategoryGroup {
	slug: string;
	label: string;
	abilities: McpAvailableAbility[];
}

/**
 * Build the render-time list of category sections. We walk
 * `available_categories` in backend order so the UI section order stays
 * controlled server-side, then append any ability whose category slug
 * isn't in that list into an "Other" bucket so they remain visible.
 */
function groupAbilitiesByCategory(
	abilities: McpAvailableAbility[],
	categories: McpAvailableCategory[]
): CategoryGroup[] {
	const bySlug = new Map< string, McpAvailableAbility[] >();
	for ( const ability of abilities ) {
		const slug = ability.category || UNCATEGORIZED_SLUG;
		const bucket = bySlug.get( slug ) ?? [];
		bucket.push( ability );
		bySlug.set( slug, bucket );
	}

	const groups: CategoryGroup[] = [];
	for ( const category of categories ) {
		const bucket = bySlug.get( category.slug );
		if ( bucket && bucket.length > 0 ) {
			groups.push( { slug: category.slug, label: category.label, abilities: bucket } );
			bySlug.delete( category.slug );
		}
	}

	// Anything left didn't match a declared category — surface it under
	// "Other" rather than dropping it.
	const leftovers: McpAvailableAbility[] = [];
	for ( const bucket of bySlug.values() ) {
		leftovers.push( ...bucket );
	}
	if ( leftovers.length > 0 ) {
		groups.push( {
			slug: UNCATEGORIZED_SLUG,
			label: __( 'Other' ),
			abilities: leftovers,
		} );
	}

	return groups;
}

export default function AiMcpAvailableToolsContent() {
	const dispatch = useDispatch();

	const { data: settings } = useFetchMcpSettings();
	const saveSettings = useSaveMcpSettings();

	const onToggleAbility = useCallback(
		( abilityName: string, next: boolean ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_ai_mcp_ability_toggled', {
					ability_name: abilityName,
					enabled: next,
				} )
			);
			saveSettings.mutate( { abilities: { [ abilityName ]: next } } );
		},
		[ dispatch, saveSettings ]
	);

	const onToggleCategory = useCallback(
		( group: CategoryGroup, next: boolean ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_ai_mcp_category_toggled', {
					category: group.slug,
					enabled: next,
					ability_count: group.abilities.length,
				} )
			);
			// Send one payload per category — the backend merges by name, so
			// we flip every ability in this group in a single request.
			const payload: Record< string, boolean > = {};
			for ( const ability of group.abilities ) {
				payload[ ability.name ] = next;
			}
			saveSettings.mutate( { abilities: payload } );
		},
		[ dispatch, saveSettings ]
	);

	// `settings?.x ?? []` returns a fresh array on every render, which would
	// rotate the useMemo deps below — wrap in useMemo so the array identity
	// is stable between renders where the underlying data hasn't changed.
	const abilities = useMemo(
		() => settings?.available_abilities ?? [],
		[ settings?.available_abilities ]
	);
	const categories = useMemo(
		() => settings?.available_categories ?? [],
		[ settings?.available_categories ]
	);

	const groups = useMemo(
		() => groupAbilitiesByCategory( abilities, categories ),
		[ abilities, categories ]
	);

	return (
		<VStack className="a4a-ai-mcp-overview" spacing={ 6 }>
			<Text className="a4a-ai-mcp-overview__intro" size={ 15 }>
				{ preventWidows(
					__( 'Control which AI tools are available to your external AI assistant.' )
				) }
			</Text>
			{ ! abilities.length ? (
				<VStack spacing={ 4 }>
					<Card>
						<CardBody>
							<HStack alignment="left" spacing={ 4 }>
								<ToggleControl label="" checked={ false } onChange={ () => {} } disabled />
								<VStack spacing={ 1 }>
									<TextPlaceholder style={ { width: '200px' } } />
									<TextPlaceholder style={ { width: '300px' } } />
								</VStack>
							</HStack>
						</CardBody>
					</Card>
				</VStack>
			) : (
				<VStack spacing={ 4 }>
					{ groups.map( ( group ) => {
						const allEnabled = group.abilities.every( ( ability ) => ability.enabled );

						return (
							<Card key={ group.slug }>
								<CardBody>
									<HStack justify="space-between" alignment="center">
										<Text as="h3" weight={ 600 } size={ 14 }>
											{ group.label }
										</Text>
										<ToggleControl
											checked={ allEnabled }
											label={ __( 'Enable all' ) }
											onChange={ ( next: boolean ) => onToggleCategory( group, next ) }
										/>
									</HStack>
								</CardBody>
								<CardDivider style={ { borderColor: 'var(--color-neutral-5)' } } />
								<CardBody>
									<VStack spacing={ 4 }>
										{ group.abilities.map( ( ability ) => (
											<ToggleControl
												key={ ability.name }
												checked={ ability.enabled }
												label={ ability.title }
												help={ ability.description }
												onChange={ ( next: boolean ) => onToggleAbility( ability.name, next ) }
											/>
										) ) }
									</VStack>
								</CardBody>
							</Card>
						);
					} ) }
				</VStack>
			) }
		</VStack>
	);
}
