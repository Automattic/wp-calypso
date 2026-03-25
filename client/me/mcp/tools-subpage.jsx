import { sitesQuery, userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	ToggleControl,
	Card,
	CardBody,
} from '@wordpress/components';
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
import { useMcpPageChrome } from './mcp-page-header';
import {
	CATEGORY_ORDER,
	SUB_CATEGORY_ORDER,
	getSubCategory,
	groupToolsByDisplayCategory,
	sortTools,
} from './read-groups';
import { getAccountMcpAbilities } from './utils';

import './style.scss';

/**
 * @param {Object} props
 * @param {string} props.path
 * @param {string} props.pageViewTitle
 * @param {string} props.headerTitle
 * @param {(tool: import('@automattic/api-core').McpAbility) => boolean} props.filterTool
 * @param {'categories'|undefined} [props.groupingMode] When `"categories"`, tools are grouped by Dashboard MCP display category (`getDisplayCategory` + `CATEGORY_ORDER`).
 */
export default function McpToolsSubpage( {
	path,
	pageViewTitle,
	headerTitle,
	filterTool,
	groupingMode,
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

	const handleToolChange = ( toolId, enabled ) => {
		mutation.mutate( {
			mcp_abilities: {
				account: {
					[ toolId ]: enabled,
				},
			},
		} );
	};

	/**
	 * @param {Array<[string, import('@automattic/api-core').McpAbility]>} groupTools
	 * @param {boolean} enabled
	 */
	const handleGroupEnableAll = ( groupTools, enabled ) => {
		if ( groupTools.length === 0 ) {
			return;
		}
		const account = Object.fromEntries( groupTools.map( ( [ toolId ] ) => [ toolId, enabled ] ) );
		mutation.mutate( {
			mcp_abilities: {
				account,
			},
		} );
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

	const renderSubGroupedTools = ( categoryTools, categoryName ) => {
		const subGrouped = {};
		categoryTools.forEach( ( [ toolId, tool ] ) => {
			const sub = getSubCategory( toolId, tool ) ?? '';
			if ( ! subGrouped[ sub ] ) {
				subGrouped[ sub ] = [];
			}
			subGrouped[ sub ].push( [ toolId, tool ] );
		} );

		const order = SUB_CATEGORY_ORDER[ categoryName ] ?? [];
		const subGroups = order.filter( ( sub ) => subGrouped[ sub ] && subGrouped[ sub ].length > 0 );

		return subGroups.map( ( subName, index ) => (
			<Fragment key={ subName }>
				{ index > 0 && <div className="mcp-tools-subpage__sub-divider" /> }
				<div
					className={
						index === 0 ? 'mcp-tools-subpage__group-body' : 'mcp-tools-subpage__sub-group-body'
					}
				>
					<VStack spacing={ 6 }>{ renderToolToggles( sortTools( subGrouped[ subName ] ) ) }</VStack>
				</div>
			</Fragment>
		) );
	};

	const renderGroupedToolsByCategory = () => {
		const grouped = groupToolsByDisplayCategory( tools );

		return (
			<VStack spacing={ 4 }>
				{ CATEGORY_ORDER.map( ( categoryName ) => {
					const groupTools = grouped[ categoryName ];
					if ( ! groupTools || groupTools.length === 0 ) {
						return null;
					}
					const allEnabled = groupTools.every( ( [ , t ] ) => t.enabled );
					const subOrder = SUB_CATEGORY_ORDER[ categoryName ];

					return (
						<Card key={ categoryName }>
							<CardBody className="mcp-tools-subpage__group-card-body">
								<HStack
									className="mcp-tools-subpage__group-header"
									justify="space-between"
									alignment="center"
									spacing={ 4 }
								>
									<Text
										as="h4"
										className="mcp-tools-subpage__group-title"
										weight={ 600 }
										size={ 16 }
									>
										{ categoryName }
									</Text>
									<div className="mcp-tools-subpage__group-toggle">
										<ToggleControl
											__nextHasNoMarginBottom
											checked={ allEnabled }
											disabled={ mutation.isPending }
											label={ translate( 'Enable all' ) }
											onChange={ ( checked ) => handleGroupEnableAll( groupTools, checked ) }
										/>
									</div>
								</HStack>
								{ subOrder ? (
									renderSubGroupedTools( groupTools, categoryName )
								) : (
									<div className="mcp-tools-subpage__group-body">
										<VStack spacing={ 6 }>{ renderToolToggles( groupTools ) }</VStack>
									</div>
								) }
							</CardBody>
						</Card>
					);
				} ) }
				{ tools.length === 0 && (
					<Card>
						<CardBody>
							<p>{ translate( 'No tools are available in this category yet.' ) }</p>
						</CardBody>
					</Card>
				) }
			</VStack>
		);
	};

	const renderFlatToolList = () => (
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
					<VStack spacing={ 4 }>
						{ tools.map( ( [ toolId, tool ] ) => (
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
						{ tools.length === 0 && (
							<p>{ translate( 'No tools are available in this category yet.' ) }</p>
						) }
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);

	return (
		<Main wideLayout className="mcp mcp-tools-subpage">
			<PageViewTracker path={ path } title={ pageViewTitle } />
			<DocumentHead title={ documentTitle } />
			<NavigationHeader { ...navigationHeaderProps } />
			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ headerTitle }
			</HeaderCake>
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
			{ ! isLoadingUserSettings &&
				! reauthRequired &&
				( groupingMode === 'categories' ? renderGroupedToolsByCategory() : renderFlatToolList() ) }
		</Main>
	);
}
