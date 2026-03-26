import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { Icon, __experimentalVStack as VStack, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { seen, pencil, notAllowed, connection } from '@wordpress/icons';
import {
	getAccountMcpAbilities,
	getDisabledSiteIds,
	getEnabledSiteIds,
} from '../../../me/mcp/utils';
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
		return { text: __( 'None enabled' ), intent: 'warning' as const };
	}
	return { text: `${ enabledCount } of ${ tools.length }` };
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
	return { text: `${ enabledCount } of ${ tools.length }` };
}

function McpComponent() {
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
		const accountAbilities: Record< string, boolean > = {};
		Object.keys( mcpAbilities ).forEach( ( toolId ) => {
			const tool = mcpAbilities[ toolId ] as McpAbility;
			if ( enabled ) {
				// Only enable read tools by default; write tools start disabled
				accountAbilities[ toolId ] = ! isWriteTool( toolId, tool );
			} else {
				accountAbilities[ toolId ] = false;
			}
		} );

		// Clear site-level overrides when toggling on or off
		const sitesToReset = [
			...disabledSiteIds.map( ( id ) => ( { blog_id: id, account_tools_enabled: true } ) ),
			...enabledSiteIds.map( ( id ) => ( { blog_id: id, site_level_enabled: false } ) ),
		];

		mutation.mutate( {
			mcp_abilities: {
				account: accountAbilities,
				...( sitesToReset.length > 0 && { sites: sitesToReset } ),
			},
		} as any );
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
						'Allow external AI agents to access your WordPress.com account and sites via MCP.'
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
