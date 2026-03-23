import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getAccountMcpAbilities } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { Card, CardBody, CardDivider } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { CATEGORY_ORDER, getDisplayCategory, isWriteTool } from '../categories';

interface McpAbility {
	title: string;
	description: string;
	enabled: boolean;
	category?: string;
	category_label?: string;
	type?: string;
	readonly?: boolean;
	visible?: boolean;
	annotations?: Record< string, unknown >;
}

export default function McpRead() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );

	// Show all tools on the Read page — the type field may not be set by all tools,
	// and the Figma Read page shows all read-type tools (Sites & Content, Posts, etc.)
	const allTools = ( Object.entries( mcpAbilities ) as Array< [ string, McpAbility ] > ).filter(
		( [ , tool ] ) => tool.visible !== false
	);
	const readTools = allTools.filter( ( [ toolId, tool ] ) => ! isWriteTool( toolId, tool ) );

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	const handleToolChange = ( toolId: string, enabled: boolean ) => {
		mutation.mutate( {
			mcp_abilities: {
				account: {
					[ toolId ]: enabled,
				},
			},
		} as any );
	};

	const handleEnableAll = ( categoryTools: Array< [ string, McpAbility ] >, enabled: boolean ) => {
		const accountAbilities: Record< string, boolean > = {};
		categoryTools.forEach( ( [ toolId ] ) => {
			accountAbilities[ toolId ] = enabled;
		} );
		mutation.mutate( {
			mcp_abilities: {
				account: accountAbilities,
			},
		} as any );
	};

	// Group tools by display category
	const grouped: Record< string, Array< [ string, McpAbility ] > > = {};
	readTools.forEach( ( [ toolId, tool ] ) => {
		const category = getDisplayCategory( toolId, tool );
		if ( ! grouped[ category ] ) {
			grouped[ category ] = [];
		}
		grouped[ category ].push( [ toolId, tool ] );
	} );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'Read' ) }
					description={ __( 'View your sites, posts, and account info.' ) }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_read_view" />
			<VStack spacing={ 4 }>
				{ CATEGORY_ORDER.map( ( categoryName ) => {
					const categoryTools = grouped[ categoryName ];
					if ( ! categoryTools || categoryTools.length === 0 ) {
						return null;
					}

					const allEnabled = categoryTools.every( ( [ , tool ] ) => tool.enabled );

					return (
						<Card key={ categoryName }>
							<CardBody>
								<HStack justify="space-between" alignment="center">
									<Text as="h3" weight={ 600 } size={ 14 }>
										{ categoryName }
									</Text>
									<ToggleControl
										__nextHasNoMarginBottom
										checked={ allEnabled }
										disabled={ mutation.isPending }
										label={ __( 'Enable all' ) }
										onChange={ ( checked ) => handleEnableAll( categoryTools, checked ) }
									/>
								</HStack>
							</CardBody>
							<CardDivider />
							<CardBody>
								<VStack spacing={ 4 }>
									{ categoryTools.map( ( [ toolId, tool ] ) => (
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
							</CardBody>
						</Card>
					);
				} ) }
			</VStack>
		</PageLayout>
	);
}
