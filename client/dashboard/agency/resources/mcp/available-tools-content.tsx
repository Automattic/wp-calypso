import {
	ToggleControl,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import { Card, CardBody, CardDivider } from '../../../components/card';
import type { RecordTracksEvent } from './types';
import type {
	McpAvailableAbility,
	McpAvailableCategory,
	McpSettings,
	McpSettingsUpdate,
} from '@automattic/api-core';

// Abilities with an unknown category bucket here, shown under "Other" so none are dropped.
const UNCATEGORIZED_SLUG = '__uncategorized__';

interface CategoryGroup {
	slug: string;
	label: string;
	abilities: McpAvailableAbility[];
}

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

	const leftovers: McpAvailableAbility[] = [];
	for ( const bucket of bySlug.values() ) {
		leftovers.push( ...bucket );
	}
	if ( leftovers.length > 0 ) {
		groups.push( { slug: UNCATEGORIZED_SLUG, label: __( 'Other' ), abilities: leftovers } );
	}

	return groups;
}

interface McpAvailableToolsProps {
	settings: McpSettings | undefined;
	onSave: ( update: McpSettingsUpdate ) => void;
	recordTracksEvent?: RecordTracksEvent;
}

export default function McpAvailableTools( {
	settings,
	onSave,
	recordTracksEvent = () => {},
}: McpAvailableToolsProps ) {
	const onToggleAbility = useCallback(
		( abilityName: string, next: boolean ) => {
			recordTracksEvent( 'calypso_a4a_ai_mcp_ability_toggled', {
				ability_name: abilityName,
				enabled: next,
			} );
			onSave( { abilities: { [ abilityName ]: next } } );
		},
		[ onSave, recordTracksEvent ]
	);

	const onToggleCategory = useCallback(
		( group: CategoryGroup, next: boolean ) => {
			recordTracksEvent( 'calypso_a4a_ai_mcp_category_toggled', {
				category: group.slug,
				enabled: next,
				ability_count: group.abilities.length,
			} );
			const payload: Record< string, boolean > = {};
			for ( const ability of group.abilities ) {
				payload[ ability.name ] = next;
			}
			onSave( { abilities: payload } );
		},
		[ onSave, recordTracksEvent ]
	);

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
		<VStack spacing={ 6 }>
			<Text size={ 15 }>
				{ __( 'Control which AI tools are available to your external AI assistant.' ) }
			</Text>
			{ ! abilities.length ? (
				<Card>
					<CardBody>
						<Text variant="muted">{ __( 'No tools available.' ) }</Text>
					</CardBody>
				</Card>
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
											__nextHasNoMarginBottom
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
												__nextHasNoMarginBottom
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
