import { siteBySlugQuery, siteSettingsQuery, siteSettingsMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { siteSettingsAIToolsMcpCategoryRoute } from '../../app/router/sites';
import { Card, CardBody, CardHeader } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import {
	CATEGORY_ORDER,
	getDisplayCategory,
	getPermissionLevel,
	getPermissionLevelBySlug,
} from '../../me/mcp/categories';
import { getMockMcpAbilities, updateMockMcpAbilities } from './mock-mcp-abilities';
import type { SiteMcpAbility } from '@automattic/api-core';

export default function SiteMcpToolsCategory( { siteSlug }: { siteSlug: string } ) {
	const { categorySlug } = siteSettingsAIToolsMcpCategoryRoute.useParams();
	const permissionLevel = getPermissionLevelBySlug( categorySlug );

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: siteSettings } = useQuery( siteSettingsQuery( site.ID ) );

	const apiAbilities = siteSettings?.mcp_abilities;
	const useMock = ! apiAbilities || Object.keys( apiAbilities ).length === 0;
	const [ mockAbilities, setMockAbilities ] = useState( getMockMcpAbilities );

	const mutation = useMutation( {
		...siteSettingsMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	// Track which tool IDs have a pending mutation so we can disable only
	// the affected toggles instead of the entire page.
	const [ pendingToolIds, setPendingToolIds ] = useState< Set< string > >( new Set() );

	const mcpAbilities = useMock ? mockAbilities : apiAbilities;
	const allTools: Array< [ string, SiteMcpAbility ] > = Object.entries( mcpAbilities );

	const isMergedWrite = categorySlug === 'write';

	// Filter to tools matching this permission level
	const tools = allTools.filter( ( [ , tool ] ) => {
		const level = getPermissionLevel( tool );
		if ( isMergedWrite ) {
			return level === 'write' || level === 'manage';
		}
		return level === categorySlug;
	} );

	const handleToolChange = ( toolId: string, enabled: boolean ) => {
		if ( useMock ) {
			setMockAbilities( updateMockMcpAbilities( { [ toolId ]: enabled } ) );
			return;
		}
		setPendingToolIds( ( prev ) => new Set( prev ).add( toolId ) );
		mutation.mutate( { mcp_abilities: { [ toolId ]: enabled } } as any, {
			onSettled: () => {
				setPendingToolIds( ( prev ) => {
					const next = new Set( prev );
					next.delete( toolId );
					return next;
				} );
			},
		} );
	};

	const handleSectionToggleAll = (
		sectionTools: Array< [ string, SiteMcpAbility ] >,
		enabled: boolean
	) => {
		const updates: Record< string, boolean > = {};
		sectionTools.forEach( ( [ toolId ] ) => {
			updates[ toolId ] = enabled;
		} );

		if ( useMock ) {
			setMockAbilities( updateMockMcpAbilities( updates ) );
			return;
		}

		const toolIds = sectionTools.map( ( [ toolId ] ) => toolId );
		setPendingToolIds( ( prev ) => {
			const next = new Set( prev );
			toolIds.forEach( ( id ) => next.add( id ) );
			return next;
		} );
		mutation.mutate( { mcp_abilities: updates } as any, {
			onSettled: () => {
				setPendingToolIds( ( prev ) => {
					const next = new Set( prev );
					toolIds.forEach( ( id ) => next.delete( id ) );
					return next;
				} );
			},
		} );
	};

	// Group filtered tools by functional category
	const grouped: Record< string, Array< [ string, SiteMcpAbility ] > > = {};
	tools.forEach( ( [ toolId, tool ] ) => {
		const displayCategory = getDisplayCategory( toolId, tool );
		if ( ! grouped[ displayCategory ] ) {
			grouped[ displayCategory ] = [];
		}
		grouped[ displayCategory ].push( [ toolId, tool ] );
	} );

	// Normalise a tool title to its root entity for grouping.
	const getEntity = ( toolTitle: string ) => {
		const lower = toolTitle.toLowerCase();
		const withoutVerb = lower.replace(
			/^(search|get|list|create|update|delete|view|manage|set|activate|install|deactivate)\s+/,
			''
		);
		const withoutFiller = withoutVerb.replace( /\b(site|your|a|an|all)\s+/g, '' );
		const firstWord = withoutFiller.split( ' ' )[ 0 ] || '';
		const singularised = firstWord.replace( /ies$/, 'y' ).replace( /(?<![su])s$/, '' );
		const adjectiveMap: Record< string, string > = {
			synced: 'pattern',
			active: 'theme',
			allowed: 'block',
		};
		return adjectiveMap[ singularised ] || singularised;
	};

	// Render tools sorted by entity group with dividers between groups.
	const renderToolsWithDividers = ( categoryTools: Array< [ string, SiteMcpAbility ] > ) => {
		const sorted = [ ...categoryTools ].sort( ( a, b ) => {
			const ea = getEntity( a[ 1 ].title );
			const eb = getEntity( b[ 1 ].title );
			if ( ea !== eb ) {
				return ea.localeCompare( eb );
			}
			return 0;
		} );

		const entityCounts: Record< string, number > = {};
		sorted.forEach( ( [ , tool ] ) => {
			const entity = getEntity( tool.title );
			if ( entity ) {
				entityCounts[ entity ] = ( entityCounts[ entity ] || 0 ) + 1;
			}
		} );

		const multiToolGroups = Object.values( entityCounts ).filter( ( c ) => c > 1 ).length;
		const showDividers = multiToolGroups >= 2;

		const elements: JSX.Element[] = [];
		let lastEntity = '';
		sorted.forEach( ( [ toolId, tool ], index ) => {
			const entity = getEntity( tool.title );
			if ( showDividers && index > 0 && entity !== lastEntity ) {
				elements.push(
					<hr
						key={ `divider-${ toolId }` }
						style={ {
							margin: 0,
							border: 'none',
							borderTop: '1px solid #e0e0e0',
							width: '100%',
						} }
					/>
				);
			}
			lastEntity = entity;
			elements.push(
				<ToggleControl
					key={ toolId }
					__nextHasNoMarginBottom
					checked={ tool.enabled }
					disabled={ pendingToolIds.has( toolId ) }
					label={ tool.title }
					help={ tool.description }
					onChange={ ( checked: boolean ) => handleToolChange( toolId, checked ) }
				/>
			);
		} );
		return elements;
	};

	const title = isMergedWrite ? __( 'Write' ) : permissionLevel?.label ?? __( 'MCP access' );
	const pageDescription = isMergedWrite
		? __( 'Create, edit, and delete content, plugins, and settings.' )
		: permissionLevel?.description ?? '';

	// Skip intermediate mcp segment in breadcrumbs
	const excludeHrefs = [ `/sites/${ siteSlug }/settings/ai-tools/mcp` ];
	const breadcrumbLength = 3;

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ breadcrumbLength } excludeHrefs={ excludeHrefs } /> }
					title={ title }
					description={ pageDescription }
				/>
			}
		>
			<VStack spacing={ 8 }>
				{ CATEGORY_ORDER.map( ( categoryName ) => {
					const categoryTools = grouped[ categoryName ];
					if ( ! categoryTools || categoryTools.length === 0 ) {
						return null;
					}

					const allEnabled = categoryTools.every( ( [ , tool ] ) => tool.enabled );
					const sectionPending = categoryTools.every( ( [ toolId ] ) =>
						pendingToolIds.has( toolId )
					);

					return (
						<Card key={ categoryName }>
							<CardHeader>
								<div style={ { flex: 1 } }>
									<SectionHeader
										level={ 3 }
										title={ categoryName }
										actions={
											<ToggleControl
												__nextHasNoMarginBottom
												checked={ allEnabled }
												disabled={ sectionPending }
												label={ <Text weight={ 400 }>{ __( 'Enable all' ) }</Text> }
												onChange={ ( checked ) => handleSectionToggleAll( categoryTools, checked ) }
											/>
										}
									/>
								</div>
							</CardHeader>
							<CardBody>
								<VStack spacing={ 4 }>{ renderToolsWithDividers( categoryTools ) }</VStack>
							</CardBody>
						</Card>
					);
				} ) }
			</VStack>
		</PageLayout>
	);
}
