import { sitesQuery, userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import SummaryButton from '@automattic/components/src/summary-button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Icon,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
} from '@wordpress/components';
import { connection, notAllowed, pencil, seen } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { SectionHeader } from '../../dashboard/components/section-header';
import { filterVisibleTools, isReadTool, isWriteTool } from './categories';
import { getAccessSummaryBadge, getWriteAccessBadge } from './hub-helpers';
import { useMcpPageChrome } from './mcp-page-header';
import { getAccountMcpAbilities, getDisabledSiteIds, getEnabledSiteIds } from './utils';

import './style.scss';

function McpComponent( { path } ) {
	const translate = useTranslate();
	const { documentTitle, navigationHeaderProps } = useMcpPageChrome();
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const {
		data: userSettings,
		isLoading: isLoadingUserSettings,
		error: userSettingsError,
	} = useQuery( userSettingsQuery() );
	const { isLoading: isLoadingSites, error: sitesError } = useQuery(
		sitesQuery( 'all', { site_visibility: 'visible', include_a8c_owned: false } )
	);

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
			dispatch( successNotice( translate( 'Settings saved.' ), { id: 'mcp-settings-saved' } ) );
		},
		onError: () => {
			dispatch(
				errorNotice( translate( 'Failed to save settings.' ), { id: 'mcp-settings-error' } )
			);
		},
	} );

	if ( userSettingsError || sitesError ) {
		return null;
	}

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const visibleTools = filterVisibleTools( Object.entries( mcpAbilities ) );
	const readTools = visibleTools.filter( ( [ , t ] ) => isReadTool( t ) );
	const writeTools = visibleTools.filter( ( [ , t ] ) => isWriteTool( t ) );

	const readEnabled = readTools.filter( ( [ , t ] ) => t.enabled ).length;
	const writeEnabled = writeTools.filter( ( [ , t ] ) => t.enabled ).length;

	const readBadge = getAccessSummaryBadge( readEnabled, readTools.length, translate );
	const writeBadge = getWriteAccessBadge( writeEnabled, writeTools.length, translate );

	const hasTools = visibleTools.length > 0;
	const anyToolsEnabled = hasTools && visibleTools.some( ( [ , tool ] ) => tool.enabled );

	const handleToggleAll = ( enabled ) => {
		const accountAbilities = {};
		Object.keys( mcpAbilities ).forEach( ( toolId ) => {
			accountAbilities[ toolId ] = enabled;
		} );

		const disabledSiteIds = getDisabledSiteIds( userSettings || {} );
		const enabledSiteIds = getEnabledSiteIds( userSettings || {} );
		const sitesToReset = [
			...disabledSiteIds.map( ( id ) => ( { blog_id: id, account_tools_enabled: true } ) ),
			...enabledSiteIds.map( ( id ) => ( { blog_id: id, site_level_enabled: false } ) ),
		];

		mutation.mutate( {
			mcp_abilities: {
				account: accountAbilities,
				...( sitesToReset.length > 0 && { sites: sitesToReset } ),
			},
		} );
	};

	const disabledSiteCount = getDisabledSiteIds( userSettings || {} ).length;
	const enabledSiteCount = getEnabledSiteIds( userSettings || {} ).length;
	const mcpAddSiteBadgeText =
		enabledSiteCount > 0
			? translate( '%(count)d sites', { args: { count: enabledSiteCount } } )
			: translate( 'No sites' );
	const mcpSiteExceptionsBadgeText = translate( '%(count)d exceptions', {
		args: { count: disabledSiteCount },
	} );

	const renderLayout = ( children ) => (
		<Main wideLayout className="mcp">
			<PageViewTracker path={ path } title="AI and MCP" />
			<DocumentHead title={ documentTitle } />
			<NavigationHeader { ...navigationHeaderProps } />
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
			{ ! isLoadingUserSettings && ! reauthRequired && children }
		</Main>
	);

	const renderContent = () => (
		<VStack spacing={ 0 } className="mcp-hub">
			<Card className="mcp-hub__panel">
				<VStack spacing={ 0 }>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ translate( 'External AI assistant access' ) }
							description={ translate(
								'Allow external AI assistants to access your WordPress.com account and sites via MCP.'
							) }
						/>

						{ hasTools && ! anyToolsEnabled ? (
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ false }
								disabled={ mutation.isPending }
								onChange={ handleToggleAll }
								label={ <Text weight="600">{ translate( 'Enable MCP access' ) }</Text> }
							/>
						) : (
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								disabled={ mutation.isPending || ! hasTools }
								onChange={ handleToggleAll }
								label={ <Text weight="600">{ translate( 'Enable MCP access' ) }</Text> }
								help={
									! hasTools
										? translate( 'No MCP tools are available for your account yet.' )
										: undefined
								}
							/>
						) }
					</VStack>

					{ /* TODO: Restore when site-level MCP PRs land */ }
					{ false && hasTools && ! anyToolsEnabled && (
						<VStack spacing={ 0 } className="mcp-hub__panel-rows">
							{ ! isLoadingSites && (
								<SummaryButton
									href="/me/mcp/add-site"
									title={ translate( 'Add to specific sites' ) }
									decoration={
										<Icon className="mcp-hub__summary-icon" icon={ connection } size={ 24 } />
									}
									badges={ [ { text: mcpAddSiteBadgeText } ] }
									density="medium"
								/>
							) }
						</VStack>
					) }
				</VStack>

				{ hasTools && anyToolsEnabled && (
					<VStack spacing={ 0 } className="mcp-hub__panel-rows">
						<SummaryButton
							href="/me/mcp/read"
							title={ translate( 'Read' ) }
							decoration={ <Icon className="mcp-hub__summary-icon" icon={ seen } size={ 24 } /> }
							badges={ [ { text: readBadge.text, intent: readBadge.intent } ] }
							density="medium"
						/>
						<SummaryButton
							href="/me/mcp/write"
							title={ translate( 'Write' ) }
							decoration={ <Icon className="mcp-hub__summary-icon" icon={ pencil } size={ 24 } /> }
							badges={ [ { text: writeBadge.text, intent: writeBadge.intent } ] }
							density="medium"
						/>
						<SummaryButton
							href="/me/mcp/mcp-sites"
							title={ translate( 'Site exceptions' ) }
							decoration={
								<Icon className="mcp-hub__summary-icon" icon={ notAllowed } size={ 24 } />
							}
							badges={
								disabledSiteCount > 0
									? [ { text: mcpSiteExceptionsBadgeText, intent: 'warning' } ]
									: []
							}
							density="medium"
						/>
					</VStack>
				) }
			</Card>

			{ hasTools && anyToolsEnabled && (
				<Card className="mcp-hub__panel mcp-hub__panel--connect">
					<SummaryButton
						href="/me/mcp/setup"
						title={ translate( 'Connect external AI assistant' ) }
						description={ translate(
							'Get instructions for connecting your external AI assistant.'
						) }
						decoration={
							<Icon className="mcp-hub__summary-icon" icon={ connection } size={ 24 } />
						}
						density="low"
					/>
				</Card>
			) }
		</VStack>
	);

	if ( ! config.isEnabled( 'mcp-settings' ) ) {
		return null;
	}

	return renderLayout( renderContent() );
}

export default McpComponent;
