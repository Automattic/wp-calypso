import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ToggleControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { getAccountMcpAbilities } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { mcpToolsCategoryRoute } from '../../../app/router/me';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
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

/** Threshold: sections with more than this many toggles get a master toggle */
const MASTER_TOGGLE_THRESHOLD = 3;

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

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 4 } /> }
					title={ title }
					description={ description }
				/>
			}
		>
			<VStack spacing={ 6 }>
				{ CATEGORY_ORDER.map( ( categoryName ) => {
					const categoryTools = grouped[ categoryName ];
					if ( ! categoryTools || categoryTools.length === 0 ) {
						return null;
					}

					const allEnabled = categoryTools.every( ( [ , tool ] ) => tool.enabled );
					const showMasterToggle = categoryTools.length > MASTER_TOGGLE_THRESHOLD;

					return (
						<Card key={ categoryName }>
							<CardBody>
								<VStack spacing={ 8 }>
									<VStack spacing={ 4 }>
										<SectionHeader level={ 3 } title={ categoryName } />
										{ showMasterToggle && (
											<ToggleControl
												__nextHasNoMarginBottom
												checked={ allEnabled }
												disabled={ mutation.isPending }
												label={ sprintf(
													/* translators: %s is category name */
													__( 'Enable all for %s' ),
													categoryName
												) }
												onChange={ ( checked ) => handleSectionToggleAll( categoryTools, checked ) }
											/>
										) }
									</VStack>
									<VStack spacing={ 4 }>
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
