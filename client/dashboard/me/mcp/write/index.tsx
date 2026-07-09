import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
	ToggleControl,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { Fragment, useRef, useState } from 'react';
import { groupIntentKey, getOverridesToMatch } from '../../../../me/mcp/group-intents';
import { groupToolsByGroup, groupToolsBySubCategory } from '../../../../me/mcp/groups';
import { getGroupDescriptors, getAccountMcpAbilities } from '../../../../me/mcp/utils';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { isWriteTool } from '../categories';
import type { McpAbility, McpGroupDescriptor } from '@automattic/api-core';

const TOOL_CATEGORY = 'write' as const;

interface ToolGroup {
	group: McpGroupDescriptor | null;
	label: string;
	tools: Array< [ string, McpAbility ] >;
}

interface SubGroup {
	subCategory: string | null;
	tools: Array< [ string, McpAbility ] >;
}

export default function McpWrite() {
	const { recordTracksEvent } = useAnalytics();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const isDesktop = useViewportMatch( 'medium' );

	const openGroupsRef = useRef( new Set< string >() );
	const [ openGroups, setOpenGroups ] = useState( () => openGroupsRef.current );
	const toggleGroupOpen = ( groupKey: string, groupName: string | null ) => {
		const willBeOpen = ! openGroupsRef.current.has( groupKey );
		if ( willBeOpen ) {
			openGroupsRef.current.add( groupKey );
		} else {
			openGroupsRef.current.delete( groupKey );
		}
		setOpenGroups( new Set( openGroupsRef.current ) );
		recordTracksEvent( 'calypso_dashboard_mcp_write_group_toggled', {
			group: groupName ?? 'other',
			is_open: willBeOpen,
		} );
	};

	const allTools = ( Object.entries( mcpAbilities ) as Array< [ string, McpAbility ] > )
		.filter( ( [ , tool ] ) => tool.visible !== false )
		.filter( ( [ toolId, tool ] ) => isWriteTool( toolId, tool ) );

	const groupDescriptors = getGroupDescriptors( userSettings || {} ) as McpGroupDescriptor[];
	const groups = groupToolsByGroup( allTools, groupDescriptors ) as ToolGroup[];
	const pageAllEnabled = allTools.length > 0 && allTools.every( ( [ , tool ] ) => tool.enabled );

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	const handleToolChange = ( toolId: string, enabled: boolean, groupName: string | null ) => {
		mutation.mutate(
			{
				mcp_abilities: {
					account: { [ toolId ]: enabled },
				},
			} as any,
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_mcp_write_tool_toggled', {
						tool_id: toolId,
						enabled,
						group: groupName ?? 'other',
					} );
				},
			}
		);
	};

	const handlePageToggle = ( enabled: boolean ) => {
		const overrides = getOverridesToMatch( allTools, enabled ) as
			| Record< string, boolean >
			| undefined;
		const groupIntents: Record< string, boolean > = { [ TOOL_CATEGORY ]: enabled };
		if ( ! enabled ) {
			groupDescriptors.forEach( ( group ) => {
				groupIntents[ groupIntentKey( TOOL_CATEGORY, group.name ) ] = false;
			} );
		}
		mutation.mutate(
			{
				mcp_abilities: {
					...( overrides && { account: overrides } ),
					group_intents: groupIntents,
				},
			} as any,
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_mcp_write_enable_all_toggled', {
						enabled,
						scope: 'page',
					} );
				},
			}
		);
	};

	const handleGroupEnableAll = (
		groupName: string | null,
		groupTools: Array< [ string, McpAbility ] >,
		enabled: boolean
	) => {
		const overrides = getOverridesToMatch( groupTools, enabled ) as
			| Record< string, boolean >
			| undefined;
		const groupIntents = groupName
			? { [ groupIntentKey( TOOL_CATEGORY, groupName ) ]: enabled }
			: undefined;

		if ( ! overrides && ! groupIntents ) {
			return;
		}

		mutation.mutate(
			{
				mcp_abilities: {
					...( overrides && { account: overrides } ),
					...( groupIntents && { group_intents: groupIntents } ),
				},
			} as any,
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_mcp_write_enable_all_toggled', {
						enabled,
						scope: 'group',
						group: groupName ?? 'other',
					} );
				},
			}
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'Write' ) }
					description={ __( 'Create, update, and manage content on your sites.' ) }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_write_view" />
			<VStack spacing={ 4 }>
				<Card>
					<CardBody>
						<ToggleControl
							__nextHasNoMarginBottom
							checked={ pageAllEnabled }
							disabled={ mutation.isPending || allTools.length === 0 }
							label={ <Text weight="600">{ __( 'Enable all' ) }</Text> }
							onChange={ handlePageToggle }
						/>
					</CardBody>
				</Card>

				{ groups.length > 0 ? (
					<VStack spacing={ 3 }>
						{ groups.map( ( { group: descriptor, label, tools: groupTools }: ToolGroup ) => {
							const groupKey = descriptor?.name ?? '__other__';
							const allGroupEnabled = groupTools.every( ( [ , t ] ) => t.enabled );
							const isOpen = openGroups.has( groupKey );

							return (
								<Card key={ groupKey }>
									<CardBody>
										{ isDesktop ? (
											<HStack justify="space-between" alignment="center" spacing={ 4 }>
												<VStack spacing={ 1 } style={ { flex: 1, minWidth: 0 } }>
													<Text truncate weight={ 600 } size={ 14 }>
														{ label }
													</Text>
													{ descriptor?.description && (
														<Text truncate variant="muted" size={ 12 }>
															{ descriptor.description }
														</Text>
													) }
												</VStack>
												<ToggleControl
													__nextHasNoMarginBottom
													checked={ allGroupEnabled }
													disabled={ mutation.isPending }
													label={ __( 'Enable all' ) }
													onChange={ ( checked ) =>
														handleGroupEnableAll( descriptor?.name ?? null, groupTools, checked )
													}
												/>
												<Button
													icon={ isOpen ? chevronUp : chevronDown }
													label={ isOpen ? __( 'Hide operations' ) : __( 'Show operations' ) }
													aria-expanded={ isOpen }
													onClick={ () => toggleGroupOpen( groupKey, descriptor?.name ?? null ) }
												/>
											</HStack>
										) : (
											<VStack spacing={ 2 }>
												<HStack justify="space-between" alignment="center">
													<VStack spacing={ 1 } style={ { flex: 1, minWidth: 0 } }>
														<Text truncate weight={ 600 } size={ 14 }>
															{ label }
														</Text>
														{ descriptor?.description && (
															<Text truncate variant="muted" size={ 12 }>
																{ descriptor.description }
															</Text>
														) }
													</VStack>
													<Button
														icon={ isOpen ? chevronUp : chevronDown }
														label={ isOpen ? __( 'Hide operations' ) : __( 'Show operations' ) }
														aria-expanded={ isOpen }
														onClick={ () => toggleGroupOpen( groupKey, descriptor?.name ?? null ) }
													/>
												</HStack>
												<ToggleControl
													__nextHasNoMarginBottom
													checked={ allGroupEnabled }
													disabled={ mutation.isPending }
													label={ __( 'Enable all' ) }
													onChange={ ( checked ) =>
														handleGroupEnableAll( descriptor?.name ?? null, groupTools, checked )
													}
												/>
											</VStack>
										) }
									</CardBody>
									{ isOpen &&
										( groupToolsBySubCategory( groupTools ) as SubGroup[] ).map(
											( { subCategory, tools: subTools }, subIndex ) => (
												<Fragment key={ subCategory ?? '__ungrouped__' }>
													{ subIndex > 0 && (
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
														<VStack spacing={ 4 }>
															{ subTools.map( ( [ toolId, tool ] ) => (
																<ToggleControl
																	key={ toolId }
																	__nextHasNoMarginBottom
																	checked={ tool.enabled }
																	disabled={ mutation.isPending }
																	label={ tool.title }
																	help={ tool.description }
																	onChange={ ( checked ) =>
																		handleToolChange( toolId, checked, descriptor?.name ?? null )
																	}
																/>
															) ) }
														</VStack>
													</CardBody>
												</Fragment>
											)
										) }
								</Card>
							);
						} ) }
					</VStack>
				) : (
					<Card>
						<CardBody>
							<Text variant="muted">
								{ __( 'No write tools are available for your account.' ) }
							</Text>
						</CardBody>
					</Card>
				) }
			</VStack>
		</PageLayout>
	);
}
