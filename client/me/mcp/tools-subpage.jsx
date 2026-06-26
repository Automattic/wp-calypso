import { sitesQuery, userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ToggleControl,
	Card,
	CardBody,
} from '@wordpress/components';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useEffect, useState } from 'react';
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
import { getOverridesToMatch, groupIntentKey } from './group-intents';
import { groupToolsByGroup, groupToolsBySubCategory } from './groups';
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

	const handlePageToggle = ( enabled ) => {
		const overrides = getOverridesToMatch( tools, enabled );
		const groupIntents = { [ toolCategory ]: enabled };
		if ( ! enabled ) {
			// Disabling: also clear this category's per-group intents so a future
			// newly-added ability in a group that was previously "enabled all"-ed
			// (from this same Read or Write page) can't be silently re-enabled by a
			// stale intent left over from before this disable.
			groupDescriptors.forEach( ( group ) => {
				groupIntents[ groupIntentKey( toolCategory, group.name ) ] = false;
			} );
		}
		mutation.mutate(
			{
				mcp_abilities: {
					...( overrides && { account: overrides } ),
					group_intents: groupIntents,
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
	 * @param {string|null} groupName  null for the "Other" bucket (no group intent key)
	 * @param {Array<[string, import('@automattic/api-core').McpAbility]>} groupTools
	 * @param {boolean} enabled
	 */
	const handleGroupEnableAll = ( groupName, groupTools, enabled ) => {
		const overrides = getOverridesToMatch( groupTools, enabled );
		// The "Other" bucket has no group name, so there's no group intent key to write —
		// explicit per-op overrides are the only way to change its tools' state.
		const groupIntents = groupName
			? { [ groupIntentKey( toolCategory, groupName ) ]: enabled }
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
			},
			{
				onSuccess: () => {
					recordTracksEvent( `${ eventPrefix }_enable_all_toggled`, {
						enabled,
						scope: 'group',
						group: groupName ?? 'other',
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
									label={ <Text weight="600">{ translate( 'Enable all' ) }</Text> }
									onChange={ handlePageToggle }
								/>
							</VStack>
						</CardBody>
					</Card>

					{ groups.length > 0 ? (
						<VStack spacing={ 3 }>
							{ groups.map( ( { group: descriptor, label, tools: groupTools } ) => {
								const groupKey = descriptor?.name ?? '__other__';
								const allGroupEnabled = groupTools.every( ( [ , t ] ) => t.enabled );
								const isOpen = openGroups.has( groupKey );

								return (
									<Card key={ groupKey }>
										<CardBody>
											<div className="mcp-tools-subpage__group-header">
												<VStack spacing={ 1 } className="mcp-tools-subpage__group-info">
													<Text truncate weight={ 600 } size={ 14 }>
														{ label }
													</Text>
													{ descriptor?.description && (
														<Text truncate variant="muted" size={ 12 }>
															{ descriptor.description }
														</Text>
													) }
												</VStack>
												<div className="mcp-tools-subpage__group-toggle">
													<ToggleControl
														__nextHasNoMarginBottom
														checked={ allGroupEnabled }
														disabled={ mutation.isPending }
														label={ translate( 'Enable all' ) }
														onChange={ ( checked ) =>
															handleGroupEnableAll( descriptor?.name ?? null, groupTools, checked )
														}
													/>
												</div>
												<Button
													className="mcp-tools-subpage__group-chevron"
													icon={ isOpen ? chevronUp : chevronDown }
													label={ translate( 'Show operations' ) }
													aria-expanded={ isOpen }
													onClick={ () => toggleGroupOpen( groupKey ) }
												/>
											</div>
											{ isOpen &&
												groupToolsBySubCategory( groupTools ).map(
													( { subCategory, tools: subTools }, subIndex ) => (
														<Fragment key={ subCategory ?? '__ungrouped__' }>
															{ subIndex > 0 && <div className="mcp-tools-subpage__sub-divider" /> }
															<div
																className={
																	subIndex === 0
																		? 'mcp-tools-subpage__group-body'
																		: 'mcp-tools-subpage__sub-group-body'
																}
															>
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
																				handleToolChange( toolId, checked )
																			}
																		/>
																	) ) }
																</VStack>
															</div>
														</Fragment>
													)
												) }
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
