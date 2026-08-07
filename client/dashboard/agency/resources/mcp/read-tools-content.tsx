import {
	Button,
	ToggleControl,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useCallback, useMemo, useState } from 'react';
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

// TODO: The settings endpoint returns categories without a description, so we
// fill them in here. Once it sends one, add `description` to McpAvailableCategory,
// prefer that value, and delete this map. A slug missing from this map simply
// renders without a description.
const CATEGORY_DESCRIPTIONS: Record< string, string > = {
	'agencies-profile': __( 'Your agency profile, team members, and partner tier progress.' ),
	'agencies-sites': __( 'Browse the sites your agency manages and their full records.' ),
	'agencies-site-ops': __(
		'Health, uptime, security scans, plugins, and tags across your managed sites.'
	),
	'agencies-migrations': __( 'Migration jobs, their current status, and incentive participation.' ),
	'agencies-commissions': __(
		'Referral and WooPayments earnings, upcoming payouts, and client referrals.'
	),
	'agencies-billing': __( 'Charges, invoices, and upcoming subscription renewals.' ),
	'agencies-knowledge-base': __( 'Search and read Automattic for Agencies help articles.' ),
	'agencies-feedback': __(
		'Send feedback about the MCP tools to the Automattic for Agencies team.'
	),
};

interface CategoryGroup {
	slug: string;
	label: string;
	description?: string;
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
			groups.push( {
				slug: category.slug,
				label: category.label,
				description: CATEGORY_DESCRIPTIONS[ category.slug ],
				abilities: bucket,
			} );
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

function toPayload( abilities: McpAvailableAbility[], enabled: boolean ) {
	const payload: Record< string, boolean > = {};
	for ( const ability of abilities ) {
		payload[ ability.name ] = enabled;
	}
	return payload;
}

interface McpReadToolsProps {
	settings: McpSettings | undefined;
	isSaving?: boolean;
	onSave: ( update: McpSettingsUpdate ) => void;
	recordTracksEvent?: RecordTracksEvent;
}

export default function McpReadTools( {
	settings,
	isSaving,
	onSave,
	recordTracksEvent = () => {},
}: McpReadToolsProps ) {
	const isDesktop = useViewportMatch( 'medium' );
	const [ openGroups, setOpenGroups ] = useState( () => new Set< string >() );

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

	const toggleGroupOpen = useCallback(
		( group: CategoryGroup ) => {
			setOpenGroups( ( current ) => {
				const next = new Set( current );
				const willBeOpen = ! next.has( group.slug );
				if ( willBeOpen ) {
					next.add( group.slug );
				} else {
					next.delete( group.slug );
				}
				recordTracksEvent( 'calypso_a4a_ai_mcp_category_expanded', {
					category: group.slug,
					is_open: willBeOpen,
				} );
				return next;
			} );
		},
		[ recordTracksEvent ]
	);

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
			onSave( { abilities: toPayload( group.abilities, next ) } );
		},
		[ onSave, recordTracksEvent ]
	);

	const onToggleAll = useCallback(
		( next: boolean ) => {
			recordTracksEvent( 'calypso_a4a_ai_mcp_enable_all_toggled', {
				enabled: next,
				ability_count: abilities.length,
			} );
			onSave( { abilities: toPayload( abilities, next ) } );
		},
		[ abilities, onSave, recordTracksEvent ]
	);

	const allEnabled = abilities.length > 0 && abilities.every( ( ability ) => ability.enabled );

	if ( ! abilities.length ) {
		return (
			<Card>
				<CardBody>
					<Text variant="muted">{ __( 'No tools available.' ) }</Text>
				</CardBody>
			</Card>
		);
	}

	return (
		<VStack spacing={ 4 }>
			<Card>
				<CardBody>
					<ToggleControl
						__nextHasNoMarginBottom
						checked={ allEnabled }
						disabled={ isSaving }
						label={ <Text weight={ 600 }>{ __( 'Enable all' ) }</Text> }
						onChange={ onToggleAll }
					/>
				</CardBody>
			</Card>

			<VStack spacing={ 3 }>
				{ groups.map( ( group ) => {
					const allGroupEnabled = group.abilities.every( ( ability ) => ability.enabled );
					const isOpen = openGroups.has( group.slug );

					return (
						<Card key={ group.slug }>
							<CardBody>
								<HStack
									justify="space-between"
									alignment={ isDesktop ? 'center' : 'flex-start' }
									spacing={ 4 }
									direction={ isDesktop ? 'row' : 'column' }
								>
									<VStack spacing={ 1 } style={ { flex: 1, minWidth: 0 } }>
										<Text truncate as="h3" weight={ 600 } size={ 14 }>
											{ group.label }
										</Text>
										{ group.description && (
											<Text variant="muted" size={ 12 }>
												{ group.description }
											</Text>
										) }
									</VStack>
									<HStack justify="flex-end" alignment="center" spacing={ 2 } expanded={ false }>
										<ToggleControl
											__nextHasNoMarginBottom
											checked={ allGroupEnabled }
											disabled={ isSaving }
											label={ __( 'Enable all' ) }
											/* translators: %s is a tool category name, e.g. "Sites" */
											aria-label={ sprintf( __( 'Enable all %s tools' ), group.label ) }
											onChange={ ( next: boolean ) => onToggleCategory( group, next ) }
										/>
										<Button
											icon={ isOpen ? chevronUp : chevronDown }
											label={
												isOpen
													? /* translators: %s is a tool category name, e.g. "Sites" */
													  sprintf( __( 'Hide %s tools' ), group.label )
													: /* translators: %s is a tool category name, e.g. "Sites" */
													  sprintf( __( 'Show %s tools' ), group.label )
											}
											aria-expanded={ isOpen }
											onClick={ () => toggleGroupOpen( group ) }
										/>
									</HStack>
								</HStack>
							</CardBody>
							{ isOpen && (
								<>
									<CardDivider style={ { borderColor: 'var(--color-border-subtle)' } } />
									<CardBody>
										<VStack spacing={ 4 }>
											{ group.abilities.map( ( ability ) => (
												<ToggleControl
													__nextHasNoMarginBottom
													key={ ability.name }
													checked={ ability.enabled }
													disabled={ isSaving }
													label={ ability.title }
													help={ ability.description }
													onChange={ ( next: boolean ) => onToggleAbility( ability.name, next ) }
												/>
											) ) }
										</VStack>
									</CardBody>
								</>
							) }
						</Card>
					);
				} ) }
			</VStack>
		</VStack>
	);
}
