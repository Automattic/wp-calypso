import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getAccountMcpAbilities } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { EXPLORATIONS_STORAGE_KEY } from '../../../app/explorations-helper';
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

	// Filter to tools matching this permission level
	const tools = allTools.filter( ( [ , tool ] ) => getPermissionLevel( tool ) === categorySlug );

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

	const title = permissionLevel?.label ?? __( 'MCP access' );
	const description = permissionLevel?.description ?? '';

	// Option 3 (Flat) links directly here, skipping the tools index page.
	// Exclude the "MCP access" breadcrumb segment so the trail reads
	// "Preferences / AI and MCP / [Read|Write|Manage]".
	const variation = localStorage.getItem( EXPLORATIONS_STORAGE_KEY );
	const isFlat = variation === 'C';
	const excludeHrefs = isFlat ? [ '/me/preferences/ai-and-mcp/tools' ] : undefined;
	const breadcrumbLength = isFlat ? 3 : 4;

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
			<VStack spacing={ 8 }>
				{ CATEGORY_ORDER.map( ( categoryName ) => {
					const categoryTools = grouped[ categoryName ];
					if ( ! categoryTools || categoryTools.length === 0 ) {
						return null;
					}

					const anyEnabled = categoryTools.some( ( [ , tool ] ) => tool.enabled );

					return (
						<Card key={ categoryName }>
							<CardBody>
								<VStack spacing={ 8 }>
									<SectionHeader level={ 3 } title={ categoryName } />

									<ToggleControl
										__nextHasNoMarginBottom
										checked={ anyEnabled }
										disabled={ mutation.isPending }
										label={
											<Text weight="bold">
												{ anyEnabled ? __( 'Disable all' ) : __( 'Enable all' ) }
											</Text>
										}
										onChange={ ( checked ) => handleSectionToggleAll( categoryTools, checked ) }
									/>

									<VStack>
										{ categoryTools.map( ( [ toolId, tool ]: [ string, McpAbility ] ) => (
											<ToggleControl
												key={ toolId }
												__nextHasNoMarginBottom
												checked={ tool.enabled }
												disabled={ mutation.isPending }
												label={ tool.title }
												help={ tool.description }
												onChange={ ( checked ) => handleToolChange( toolId, checked ) }
											/>
										) ) }
									</VStack>
								</VStack>
							</CardBody>
						</Card>
					);
				} ) }
			</VStack>
		</PageLayout>
	);
}
