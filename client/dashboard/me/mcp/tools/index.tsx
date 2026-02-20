import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Navigate } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { seen, pencil, cog, unseen } from '@wordpress/icons';
import { getAccountMcpAbilities, getDisabledSiteIds } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { EXPLORATIONS_STORAGE_KEY } from '../../../app/explorations-helper';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkSummaryButton from '../../../components/router-link-summary-button';
import { PERMISSION_LEVEL_ORDER, getPermissionLevel } from '../categories';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

interface McpAbility {
	title: string;
	description: string;
	enabled: boolean;
	category?: string;
	category_label?: string;
	type?: string;
	annotations?: { readonly?: boolean; destructive?: boolean };
}

const LEVEL_ICONS = {
	read: seen,
	write: pencil,
	manage: cog,
} as const;

export default function McpTools() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	// Options 3 & 4 (Flat) skip this intermediate page — redirect back to AI and MCP.
	const variation = localStorage.getItem( EXPLORATIONS_STORAGE_KEY );
	if ( variation === 'C' || variation === 'D' ) {
		return <Navigate to="/me/preferences/ai-and-mcp" replace />;
	}

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const availableTools: Array< [ string, McpAbility ] > = Object.entries( mcpAbilities );
	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );

	// Group tools by permission level
	const permissionGroups: Record< string, Array< [ string, McpAbility ] > > = {};
	availableTools.forEach( ( [ toolId, tool ] ) => {
		const level = getPermissionLevel( tool );
		if ( ! permissionGroups[ level ] ) {
			permissionGroups[ level ] = [];
		}
		permissionGroups[ level ].push( [ toolId, tool ] );
	} );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'MCP access' ) }
					description={ __( 'Control what your AI assistant can do on your account and sites.' ) }
				/>
			}
		>
			<VStack spacing={ 6 }>
				{ PERMISSION_LEVEL_ORDER.map( ( level ) => {
					const tools = permissionGroups[ level.key ] || [];
					if ( tools.length === 0 ) {
						return null;
					}

					const enabledCount = tools.filter( ( [ , tool ] ) => tool.enabled ).length;

					const badges: SummaryButtonBadgeProps[] = [
						{
							text:
								enabledCount === tools.length
									? __( 'All enabled' )
									: sprintf(
											/* translators: %1$d is enabled count, %2$d is total */
											__( '%1$d of %2$d enabled' ),
											enabledCount,
											tools.length
									  ),
							intent: enabledCount === tools.length ? 'success' : 'default',
						},
					];

					return (
						<RouterLinkSummaryButton
							key={ level.key }
							to={ `/me/preferences/ai-and-mcp/tools/${ level.key }` }
							title={ level.label }
							description={ level.description }
							decoration={ <Icon icon={ LEVEL_ICONS[ level.key ] } /> }
							badges={ badges }
						/>
					);
				} ) }
				<RouterLinkSummaryButton
					to="/me/preferences/ai-and-mcp/sites"
					title={ __( 'Site restrictions' ) }
					description={ __( 'Restrict AI access for specific sites.' ) }
					decoration={ <Icon icon={ unseen } /> }
					badges={ [
						{
							text:
								disabledSiteIds.length === 0
									? __( 'No restrictions' )
									: sprintf(
											/* translators: %d is number of restricted sites */
											__( '%d restricted' ),
											disabledSiteIds.length
									  ),
							intent: disabledSiteIds.length === 0 ? 'default' : 'warning',
						},
					] }
				/>
			</VStack>
		</PageLayout>
	);
}
