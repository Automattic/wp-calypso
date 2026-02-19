import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { seen, pencil, cog } from '@wordpress/icons';
import { getAccountMcpAbilities } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
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

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const availableTools: Array< [ string, McpAbility ] > = Object.entries( mcpAbilities );

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
			</VStack>
		</PageLayout>
	);
}
