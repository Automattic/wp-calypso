import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Fragment } from 'react';
import { getAccountMcpAbilities } from '../../../../me/mcp/utils';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { Card, CardBody, CardDivider } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import {
	CATEGORY_ORDER,
	SUB_CATEGORY_ORDER,
	getDisplayCategory,
	getSubCategory,
	isWriteTool,
	sortTools,
} from '../categories';

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
	const { recordTracksEvent } = useAnalytics();
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
		mutation.mutate(
			{
				mcp_abilities: {
					account: {
						[ toolId ]: enabled,
					},
				},
			} as any,
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_mcp_read_tool_toggled', {
						tool_id: toolId,
						enabled,
					} );
				},
			}
		);
	};

	const handleEnableAll = (
		categoryTools: Array< [ string, McpAbility ] >,
		enabled: boolean,
		category: string
	) => {
		const accountAbilities: Record< string, boolean > = {};
		categoryTools.forEach( ( [ toolId ] ) => {
			accountAbilities[ toolId ] = enabled;
		} );
		mutation.mutate(
			{
				mcp_abilities: {
					account: accountAbilities,
				},
			} as any,
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_mcp_read_enable_all_toggled', {
						enabled,
						category,
					} );
				},
			}
		);
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

	const renderToolToggles = ( tools: Array< [ string, McpAbility ] > ) =>
		tools.map( ( [ toolId, tool ] ) => (
			<ToggleControl
				key={ toolId }
				__nextHasNoMarginBottom
				checked={ tool.enabled }
				disabled={ mutation.isPending }
				label={ tool.title }
				help={ tool.description }
				onChange={ ( checked ) => handleToolChange( toolId, checked ) }
			/>
		) );

	const renderSubGroupedTools = (
		categoryTools: Array< [ string, McpAbility ] >,
		categoryName: string
	) => {
		const subGrouped: Record< string, Array< [ string, McpAbility ] > > = {};
		categoryTools.forEach( ( [ toolId, tool ] ) => {
			const sub = getSubCategory( toolId, tool ) ?? '';
			if ( ! subGrouped[ sub ] ) {
				subGrouped[ sub ] = [];
			}
			subGrouped[ sub ].push( [ toolId, tool ] );
		} );

		const order = SUB_CATEGORY_ORDER[ categoryName ] ?? [];
		const subGroups = order.filter( ( sub ) => subGrouped[ sub ] && subGrouped[ sub ].length > 0 );
		// Tools with no sub-category are appended at the end so they are never silently dropped.
		const ungrouped = subGrouped[ '' ] ?? [];
		const allGroups = ungrouped.length > 0 ? [ ...subGroups, '' ] : subGroups;

		return allGroups.map( ( subName, index ) => (
			<Fragment key={ subName || '__ungrouped__' }>
				{ index > 0 && (
					<CardBody style={ { padding: 'calc(4px * 2) calc(4px * 6)' } }>
						<hr
							style={ {
								border: 'none',
								borderTop: '1px solid var(--color-border-subtle, #dcdcde)',
								margin: 0,
							} }
						/>
					</CardBody>
				) }
				<CardBody>
					<VStack spacing={ 4 }>{ renderToolToggles( sortTools( subGrouped[ subName ] ) ) }</VStack>
				</CardBody>
			</Fragment>
		) );
	};

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
					const subOrder = SUB_CATEGORY_ORDER[ categoryName ];

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
										onChange={ ( checked ) =>
											handleEnableAll( categoryTools, checked, categoryName )
										}
									/>
								</HStack>
							</CardBody>
							<CardDivider />
							{ subOrder ? (
								renderSubGroupedTools( categoryTools, categoryName )
							) : (
								<CardBody>
									<VStack spacing={ 4 }>{ renderToolToggles( categoryTools ) }</VStack>
								</CardBody>
							) }
						</Card>
					);
				} ) }
			</VStack>
		</PageLayout>
	);
}
