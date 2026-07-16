import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { Icon, __experimentalVStack as VStack, ToggleControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { seen, pencil, notAllowed, connection, globe } from '@wordpress/icons';
import { getOverridesToMatch, groupIntentKey } from '../../../me/mcp/group-intents';
import {
	getAccountMcpAbilities,
	getDisabledSiteIds,
	getEnabledSiteIds,
	getGroupDescriptors,
} from '../../../me/mcp/utils';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { Card, CardBody, CardDivider } from '../../components/card';
import ComponentViewTracker from '../../components/component-view-tracker';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { SectionHeader } from '../../components/section-header';
import { isWriteTool } from './categories';

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

function getReadBadge( tools: Array< [ string, McpAbility ] > ) {
	if ( tools.length === 0 ) {
		return { text: __( 'All enabled' ), intent: 'success' as const };
	}
	const enabledCount = tools.filter( ( [ , tool ] ) => tool.enabled ).length;
	if ( enabledCount === tools.length ) {
		return { text: __( 'All enabled' ), intent: 'success' as const };
	}
	if ( enabledCount === 0 ) {
		return { text: __( 'None enabled' ) };
	}
	return {
		/* translators: %1$d is the number of enabled tools, %2$d is the total number of tools */
		text: sprintf( __( '%1$d of %2$d enabled' ), enabledCount, tools.length ),
		intent: 'info' as const,
	};
}

function getWriteBadge( tools: Array< [ string, McpAbility ] > ) {
	if ( tools.length === 0 ) {
		return { text: __( 'All enabled' ), intent: 'success' as const };
	}
	const enabledCount = tools.filter( ( [ , tool ] ) => tool.enabled ).length;
	if ( enabledCount === tools.length ) {
		return { text: __( 'All enabled' ), intent: 'success' as const };
	}
	if ( enabledCount === 0 ) {
		return { text: __( 'Disabled' ) };
	}
	return {
		/* translators: %1$d is the number of enabled tools, %2$d is the total number of tools */
		text: sprintf( __( '%1$d of %2$d enabled' ), enabledCount, tools.length ),
		intent: 'info' as const,
	};
}

function McpComponent() {
	const { recordTracksEvent } = useAnalytics();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const availableTools = (
		Object.entries( mcpAbilities ) as Array< [ string, McpAbility ] >
	 ).filter( ( [ , tool ] ) => tool.visible !== false );
	const mcpEnabled =
		availableTools.length > 0 && availableTools.some( ( [ , tool ] ) => tool.enabled );

	const readTools = availableTools.filter( ( [ toolId, tool ] ) => ! isWriteTool( toolId, tool ) );
	const writeTools = availableTools.filter( ( [ toolId, tool ] ) => isWriteTool( toolId, tool ) );

	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );
	const enabledSiteIds = getEnabledSiteIds( userSettings || {} );

	const exceptionCount = disabledSiteIds.length;
	const exceptionBadge =
		exceptionCount > 0
			? { text: `${ exceptionCount } exceptions`, intent: 'warning' as const }
			: { text: __( 'No exceptions' ) };

	const addSiteBadge =
		enabledSiteIds.length > 0
			? { text: `${ enabledSiteIds.length } sites`, intent: 'success' as const }
			: { text: __( 'No sites added' ) };

	const readBadge = getReadBadge( readTools );
	const writeBadge = getWriteBadge( writeTools );

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'Settings saved.' ),
				error: __( 'Failed to save settings.' ),
			},
		},
	} );

	const handleMcpToggle = ( enabled: boolean ) => {
		const overrides = getOverridesToMatch( Object.entries( mcpAbilities ), enabled ) as
			| Record< string, boolean >
			| undefined;

		const groupIntents: Record< string, boolean > = { read: enabled, write: enabled };
		if ( ! enabled ) {
			getGroupDescriptors( userSettings || {} ).forEach( ( group ) => {
				groupIntents[ groupIntentKey( 'read', group.name ) ] = false;
				groupIntents[ groupIntentKey( 'write', group.name ) ] = false;
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
					recordTracksEvent( 'calypso_dashboard_mcp_account_toggled', { enabled } );
				},
			}
		);
	};

	if ( ! config.isEnabled( 'mcp-settings' ) ) {
		return null;
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'AI and MCP' ) }
					description={ __(
						'Control how AI assistants interact with your WordPress.com account and sites.'
					) }
					prefix={ <Breadcrumbs length={ 2 } /> }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_view" />
			<VStack spacing={ 4 }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader
								level={ 3 }
								title={ __( 'External AI agent access' ) }
								description={ __(
									'Allow external AI agents to access your WordPress.com account and sites via MCP.'
								) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ mcpEnabled }
								disabled={ mutation.isPending }
								label={ __( 'Enable MCP access' ) }
								onChange={ handleMcpToggle }
							/>
						</VStack>
					</CardBody>

					{ mcpEnabled && (
						<>
							<CardDivider />
							<RouterLinkSummaryButton
								to="/me/preferences/mcp/read"
								density="medium"
								title={ __( 'Read' ) }
								decoration={ <Icon icon={ seen } size={ 24 } /> }
								badges={ [ readBadge ] }
							/>
							<RouterLinkSummaryButton
								to="/me/preferences/mcp/write"
								density="medium"
								title={ __( 'Write' ) }
								decoration={ <Icon icon={ pencil } size={ 24 } /> }
								badges={ [ writeBadge ] }
							/>
							<RouterLinkSummaryButton
								to="/me/preferences/mcp/mcp-sites"
								density="medium"
								title={ __( 'Site exceptions' ) }
								decoration={ <Icon icon={ notAllowed } size={ 24 } /> }
								badges={ [ exceptionBadge ] }
							/>
						</>
					) }
					{ ! mcpEnabled && (
						<>
							<CardDivider />
							<RouterLinkSummaryButton
								to="/me/preferences/mcp/mcp-sites"
								density="medium"
								title={ __( 'Add to specific sites' ) }
								decoration={ <Icon icon={ globe } size={ 24 } /> }
								badges={ [ addSiteBadge ] }
							/>
						</>
					) }
				</Card>

				{ mcpEnabled && (
					<RouterLinkSummaryButton
						to="/me/preferences/mcp/setup"
						title={ __( 'Connect external AI assistant' ) }
						description={ __( 'Get instructions for connecting your external AI assistant.' ) }
						decoration={ <Icon icon={ connection } size={ 24 } /> }
					/>
				) }
			</VStack>
		</PageLayout>
	);
}

export default McpComponent;
