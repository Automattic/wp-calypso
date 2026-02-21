/**
 * MCP Tools — Permission level hub (Option B)
 * Legacy port of: client/dashboard/me/mcp/tools/index.tsx
 *
 * For Options C–G this page redirects back to /me/mcp (they skip the intermediate hub).
 */
import { userSettingsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import SummaryButton from '@automattic/components/src/summary-button';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Icon } from '@wordpress/components';
import { seen, pencil, cog, unseen } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { PERMISSION_LEVEL_ORDER, getPermissionLevel } from '../../dashboard/me/mcp/categories';
import { getAccountMcpAbilities, getDisabledSiteIds } from './utils';

const EXPLORATIONS_STORAGE_KEY = 'mcp-explore-variation';

const LEVEL_ICONS = {
	read: seen,
	write: pencil,
	manage: cog,
};

export default function McpTools( { path } ) {
	const translate = useTranslate();
	const { data: userSettings } = useQuery( userSettingsQuery() );

	// Options C–G skip this intermediate page — redirect back to /me/mcp.
	const variation = localStorage.getItem( EXPLORATIONS_STORAGE_KEY );
	useEffect( () => {
		if ( [ 'C', 'D', 'E', 'F', 'G' ].includes( variation ) ) {
			page.redirect( '/me/mcp' );
		}
	}, [ variation ] );

	if ( [ 'C', 'D', 'E', 'F', 'G' ].includes( variation ) ) {
		return null;
	}

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const availableTools = Object.entries( mcpAbilities );
	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );

	// Group tools by permission level
	const permissionGroups = {};
	availableTools.forEach( ( [ toolId, tool ] ) => {
		const level = getPermissionLevel( tool );
		if ( ! permissionGroups[ level ] ) {
			permissionGroups[ level ] = [];
		}
		permissionGroups[ level ].push( [ toolId, tool ] );
	} );

	return (
		<Main wideLayout className="mcp-tools">
			<PageViewTracker path={ path } title="MCP Tools" />
			<DocumentHead title={ translate( 'MCP access' ) } />
			<NavigationHeader navigationItems={ [] } title={ translate( 'MCP access' ) } />
			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ translate( 'MCP access' ) }
			</HeaderCake>
			<VStack spacing={ 6 }>
				{ PERMISSION_LEVEL_ORDER.map( ( level ) => {
					const tools = permissionGroups[ level.key ] || [];
					if ( tools.length === 0 ) {
						return null;
					}

					const enabledCount = tools.filter( ( [ , tool ] ) => tool.enabled ).length;

					let badgeIntent = 'default';
					if ( enabledCount === tools.length ) {
						badgeIntent = 'success';
					} else if ( enabledCount > 0 ) {
						badgeIntent = 'info';
					}

					const badges = [
						{
							text:
								enabledCount === tools.length
									? translate( 'All enabled' )
									: translate( '%(enabledCount)d of %(totalCount)d enabled', {
											args: { enabledCount, totalCount: tools.length },
									  } ),
							intent: badgeIntent,
						},
					];

					return (
						<SummaryButton
							key={ level.key }
							href={ `/me/mcp-tools/${ level.key }` }
							title={ level.label }
							description={ level.description }
							decoration={ <Icon icon={ LEVEL_ICONS[ level.key ] } /> }
							badges={ badges }
						/>
					);
				} ) }
				<SummaryButton
					href="/me/mcp-sites"
					title={ translate( 'Site restrictions' ) }
					description={ translate( 'Restrict AI access for specific sites.' ) }
					decoration={ <Icon icon={ unseen } /> }
					badges={ [
						{
							text:
								disabledSiteIds.length === 0
									? translate( 'No restrictions' )
									: translate( '%(count)d restricted', {
											args: { count: disabledSiteIds.length },
									  } ),
							intent: disabledSiteIds.length === 0 ? 'default' : 'warning',
						},
					] }
				/>
			</VStack>
		</Main>
	);
}
