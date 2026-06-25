import { sitesQuery, userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Badge } from '@automattic/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	FlexItem,
	ToggleControl,
	Card,
	CardBody,
} from '@wordpress/components';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { SectionHeader } from '../../dashboard/components/section-header';
import { filterVisibleTools } from './categories';
import { groupToolsByGroup } from './groups';
import { getAccessSummaryBadge, getWriteAccessBadge } from './hub-helpers';
import { useMcpPageChrome } from './mcp-page-header';
import { getAccountMcpAbilities, getGroupDescriptors } from './utils';

import './style.scss';

/**
 * @param {Object} props
 * @param {string} props.path
 * @param {string} props.pageViewTitle
 * @param {string} props.headerTitle
 * @param {(tool: import('@automattic/api-core').McpAbility) => boolean} props.filterTool
 * @param {'read'|'write'} props.toolCategory
 */
export default function McpToolsSubpage( {
	path,
	pageViewTitle,
	headerTitle,
	filterTool,
	toolCategory,
} ) {
	const translate = useTranslate();
	const { documentTitle, navigationHeaderProps } = useMcpPageChrome();
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const {
		data: userSettings,
		isLoading: isLoadingUserSettings,
		error: userSettingsError,
	} = useQuery( userSettingsQuery() );
	useQuery( sitesQuery( 'all', { site_visibility: 'visible' } ) );

	const [ reauthRequired, setReauthRequired ] = useState( false );
	const [ openGroups, setOpenGroups ] = useState( () => new Set() );

	const toggleGroupOpen = ( groupKey ) => {
		setOpenGroups( ( current ) => {
			const next = new Set( current );
			if ( next.has( groupKey ) ) {
				next.delete( groupKey );
			} else {
				next.add( groupKey );
			}
			return next;
		} );
	};

	useEffect( () => {
		const checkReauth = () => setReauthRequired( twoStepAuthorization.isReauthRequired() );
		twoStepAuthorization.on( 'change', checkReauth );
		checkReauth();
		return () => twoStepAuthorization.off( 'change', checkReauth );
	}, [] );

	const mutation = useMutation( {
		...userSettingsMutation(),
		onSuccess: ( newData ) => {
			queryClient.setQueryData( userSettingsQuery().queryKey, newData );
			dispatch( successNotice( translate( 'MCP settings saved.' ), { id: 'mcp-settings-saved' } ) );
		},
		onError: () => {
			dispatch(
				errorNotice( translate( 'Failed to save MCP settings.' ), { id: 'mcp-settings-error' } )
			);
		},
	} );

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const tools = filterVisibleTools( Object.entries( mcpAbilities ) ).filter( ( [ , tool ] ) =>
		filterTool( tool )
	);
	const groupDescriptors = getGroupDescriptors( userSettings || {} );
	const groups = groupToolsByGroup( tools, groupDescriptors );
	const getBadge = toolCategory === 'write' ? getWriteAccessBadge : getAccessSummaryBadge;

	const eventPrefix =
		toolCategory === 'write' ? 'calypso_dashboard_mcp_write' : 'calypso_dashboard_mcp_read';

	const handleToolChange = ( toolId, enabled ) => {
		mutation.mutate(
			{
				mcp_abilities: {
					account: {
						[ toolId ]: enabled,
					},
				},
			},
			{
				onSuccess: () => {
					recordTracksEvent( `${ eventPrefix }_tool_toggled`, { tool_id: toolId, enabled } );
				},
			}
		);
	};

	/**
	 * A group intent only sets the *default* for abilities with no explicit
	 * per-op setting — an explicit override (from an earlier individual toggle)
	 * always wins (see SettingsHelper::is_ability_enabled()). So "Enable all"
	 * also force-writes an explicit override for any tool in scope that
	 * disagrees with the new state, otherwise previously-toggled tools would
	 * silently stay stuck regardless of the group intent.
	 * @param {Array<[string, import('@automattic/api-core').McpAbility]>} scopedTools
	 * @param {boolean} enabled
	 * @returns {Record<string, boolean>|undefined}
	 */
	const getOverridesToMatch = ( scopedTools, enabled ) => {
		const overrides = {};
		scopedTools.forEach( ( [ toolId, tool ] ) => {
			if ( tool.enabled !== enabled ) {
				overrides[ toolId ] = enabled;
			}
		} );
		return Object.keys( overrides ).length > 0 ? overrides : undefined;
	};

	const handlePageToggle = ( enabled ) => {
		const overrides = getOverridesToMatch( tools, enabled );
		mutation.mutate(
			{
				mcp_abilities: {
					...( overrides && { account: overrides } ),
					group_intents: { [ toolCategory ]: enabled },
				},
			},
			{
				onSuccess: () => {
					recordTracksEvent( `${ eventPrefix }_enable_all_toggled`, { enabled, scope: 'page' } );
				},
			}
		);
	};

	/**
	 * @param {string} groupName
	 * @param {Array<[string, import('@automattic/api-core').McpAbility]>} groupTools
	 * @param {boolean} enabled
	 */
	const handleGroupEnableAll = ( groupName, groupTools, enabled ) => {
		const overrides = getOverridesToMatch( groupTools, enabled );
		mutation.mutate(
			{
				mcp_abilities: {
					...( overrides && { account: overrides } ),
					group_intents: { [ groupName ]: enabled },
				},
			},
			{
				onSuccess: () => {
					recordTracksEvent( `${ eventPrefix }_enable_all_toggled`, {
						enabled,
						scope: 'group',
						group: groupName,
					} );
				},
			}
		);
	};

	if ( userSettingsError ) {
		return null;
	}

	if ( ! config.isEnabled( 'mcp-settings' ) ) {
		return null;
	}

	const renderToolToggles = ( toolList ) =>
		toolList.map( ( [ toolId, tool ] ) => (
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

	const pageAllEnabled = tools.length > 0 && tools.every( ( [ , tool ] ) => tool.enabled );

	return (
		<Main wideLayout className="mcp mcp-tools-subpage">
			<PageViewTracker path={ path } title={ pageViewTitle } />
			<DocumentHead title={ documentTitle } />
			<NavigationHeader { ...navigationHeaderProps } />
			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ headerTitle }
			</HeaderCake>
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
			{ ! isLoadingUserSettings && ! reauthRequired && (
				<VStack spacing={ 4 }>
					<Card>
						<CardBody>
							<VStack spacing={ 4 }>
								<SectionHeader
									level={ 3 }
									title={ headerTitle }
									description={ translate(
										'Turn individual tools on or off. Changes save automatically.'
									) }
								/>
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ pageAllEnabled }
									disabled={ mutation.isPending || tools.length === 0 }
									label={ translate( 'Enable all' ) }
									onChange={ handlePageToggle }
								/>
							</VStack>
						</CardBody>
					</Card>

					{ groups.length > 0 ? (
						<VStack spacing={ 3 }>
							{ groups.map( ( { group: descriptor, label, tools: groupTools } ) => {
								const groupKey = descriptor?.name ?? '__other__';
								const enabledCount = groupTools.filter( ( [ , t ] ) => t.enabled ).length;
								const badge = getBadge( enabledCount, groupTools.length, translate );
								const allGroupEnabled = groupTools.every( ( [ , t ] ) => t.enabled );
								const isOpen = openGroups.has( groupKey );

								return (
									<Card key={ groupKey }>
										<CardBody>
											<VStack spacing={ isOpen ? 4 : 0 }>
												<HStack justify="space-between" alignment="center" spacing={ 4 }>
													<FlexItem isBlock>
														<VStack spacing={ 0 }>
															<Text truncate weight={ 600 } size={ 14 }>
																{ label }
															</Text>
															{ descriptor?.description && (
																<Text truncate variant="muted" size={ 12 }>
																	{ descriptor.description }
																</Text>
															) }
														</VStack>
													</FlexItem>
													<HStack expanded={ false } alignment="center" spacing={ 3 }>
														<Badge intent={ badge.intent }>{ badge.text }</Badge>
														{ descriptor && (
															<ToggleControl
																__nextHasNoMarginBottom
																checked={ allGroupEnabled }
																disabled={ mutation.isPending }
																label={ translate( 'Enable all' ) }
																onChange={ ( checked ) =>
																	handleGroupEnableAll( descriptor.name, groupTools, checked )
																}
															/>
														) }
														<Button
															icon={ isOpen ? chevronUp : chevronDown }
															label={ translate( 'Show operations' ) }
															aria-expanded={ isOpen }
															onClick={ () => toggleGroupOpen( groupKey ) }
														/>
													</HStack>
												</HStack>
												{ isOpen && (
													<VStack spacing={ 6 }>{ renderToolToggles( groupTools ) }</VStack>
												) }
											</VStack>
										</CardBody>
									</Card>
								);
							} ) }
						</VStack>
					) : (
						<Card>
							<CardBody>
								<p>{ translate( 'No tools are available in this category yet.' ) }</p>
							</CardBody>
						</Card>
					) }
				</VStack>
			) }
		</Main>
	);
}
