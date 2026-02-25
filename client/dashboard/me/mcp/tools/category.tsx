import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getAccountMcpAbilities } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { mcpToolsCategoryRoute } from '../../../app/router/me';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import {
	CATEGORY_ORDER,
	getDisplayCategory,
	getPermissionLevel,
	getPermissionLevelBySlug,
} from '../categories';

interface McpAbility {
	title: string;
	description: string;
	enabled: boolean;
	category?: string;
	category_label?: string;
	type?: string;
	annotations?: { readonly?: boolean; destructive?: boolean };
}

export default function McpToolsCategory() {
	const { categorySlug } = mcpToolsCategoryRoute.useParams();
	const permissionLevel = getPermissionLevelBySlug( categorySlug );

	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const allTools: Array< [ string, McpAbility ] > = Object.entries( mcpAbilities );

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
		mutation.mutate( { mcp_abilities: { account: { [ toolId ]: enabled } } } as any );
	};

	const handleSectionToggleAll = (
		sectionTools: Array< [ string, McpAbility ] >,
		enabled: boolean
	) => {
		const account: Record< string, boolean > = {};
		sectionTools.forEach( ( [ toolId ] ) => {
			account[ toolId ] = enabled;
		} );
		mutation.mutate( { mcp_abilities: { account } } as any );
	};

	// Group filtered tools by functional category
	const grouped: Record< string, Array< [ string, McpAbility ] > > = {};
	tools.forEach( ( [ toolId, tool ] ) => {
		const displayCategory = getDisplayCategory( toolId, tool );
		if ( ! grouped[ displayCategory ] ) {
			grouped[ displayCategory ] = [];
		}
		grouped[ displayCategory ].push( [ toolId, tool ] );
	} );

	// Normalise a tool title to its root entity for grouping.
	// "Search site posts" → "post", "Get synced pattern" → "pattern",
	// "List comments" → "comment", "Get theme presets" → "theme",
	// "Get active theme" → "theme", "List allowed blocks" → "block".
	const getEntity = ( toolTitle: string ) => {
		const lower = toolTitle.toLowerCase();
		// Strip the leading action verb.
		const withoutVerb = lower.replace(
			/^(search|get|list|create|update|delete|view|manage|set|activate|install|deactivate)\s+/,
			''
		);
		// Strip filler words: "site", "your", "a", "an", "all".
		const withoutFiller = withoutVerb.replace( /\b(site|your|a|an|all)\s+/g, '' );
		// Take the first remaining word as the core noun (e.g. "synced patterns" → "synced",
		// "theme presets" → "theme", "post" → "post", "allowed blocks" → "allowed").
		const firstWord = withoutFiller.split( ' ' )[ 0 ] || '';
		// Basic singular/plural normalisation.
		const singularised = firstWord
			.replace( /ies$/, 'y' ) // categories → category
			.replace( /(?<![su])s$/, '' ); // posts → post, but not "access" or "status"
		// Map adjectives to their noun: "synced" → "pattern", "active" → "theme", "allowed" → "block".
		const adjectiveMap: Record< string, string > = {
			synced: 'pattern',
			active: 'theme',
			allowed: 'block',
		};
		return adjectiveMap[ singularised ] || singularised;
	};

	// Render tools sorted by entity group with dividers between groups.
	// Dividers only appear when there are multiple distinct entity groups
	// with more than one tool each (i.e. CRUD sets or List/Get pairs).
	const renderToolsWithDividers = ( categoryTools: Array< [ string, McpAbility ] > ) => {
		// Sort tools so that same-entity tools are adjacent.
		const sorted = [ ...categoryTools ].sort( ( a, b ) => {
			const ea = getEntity( a[ 1 ].title );
			const eb = getEntity( b[ 1 ].title );
			if ( ea !== eb ) {
				return ea.localeCompare( eb );
			}
			return 0;
		} );

		// Count how many tools belong to each entity.
		const entityCounts: Record< string, number > = {};
		sorted.forEach( ( [ , tool ] ) => {
			const entity = getEntity( tool.title );
			if ( entity ) {
				entityCounts[ entity ] = ( entityCounts[ entity ] || 0 ) + 1;
			}
		} );

		// Only show dividers if there are multiple entity groups AND at least
		// two groups have more than one tool (i.e. real groupings, not singletons).
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
					label={ tool.title }
					help={ tool.description }
					onChange={ ( checked: boolean ) => handleToolChange( toolId, checked ) }
				/>
			);
		} );
		return elements;
	};

	const title = isMergedWrite ? __( 'Write' ) : permissionLevel?.label ?? __( 'MCP access' );
	const description = isMergedWrite
		? __( 'Create, edit, and delete content, plugins, and settings.' )
		: permissionLevel?.description ?? '';

	const excludeHrefs = [ '/me/preferences/ai-and-mcp/tools' ];
	const breadcrumbLength = 3;

	const renderCategoryContent = () => {
		return (
			<VStack spacing={ 8 }>
				{ CATEGORY_ORDER.map( ( categoryName ) => {
					const categoryTools = grouped[ categoryName ];
					if ( ! categoryTools || categoryTools.length === 0 ) {
						return null;
					}

					const allEnabled = categoryTools.every( ( [ , tool ] ) => tool.enabled );

					return (
						<Card key={ categoryName }>
							<CardBody>
								<SectionHeader
									level={ 3 }
									title={ categoryName }
									actions={
										<ToggleControl
											__nextHasNoMarginBottom
											checked={ allEnabled }
											label={ <Text weight={ 400 }>{ __( 'Enable all' ) }</Text> }
											onChange={ ( checked ) => handleSectionToggleAll( categoryTools, checked ) }
										/>
									}
								/>
							</CardBody>
							<hr style={ { margin: 0, border: 'none', borderTop: '1px solid #e0e0e0' } } />
							<CardBody>
								<VStack spacing={ 4 }>{ renderToolsWithDividers( categoryTools ) }</VStack>
							</CardBody>
						</Card>
					);
				} ) }
			</VStack>
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ breadcrumbLength } excludeHrefs={ excludeHrefs } /> }
					title={ title }
					description={ description }
				/>
			}
		>
			{ renderCategoryContent() }
		</PageLayout>
	);
}
