import { Icon, ToggleControl, __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { connection, listView, pencil, seen } from '@wordpress/icons';
import { Card, CardBody, CardDivider } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import SummaryButton from '../../../components/summary-button';
import type { RecordTracksEvent } from './types';
import type { McpAvailableAbility, McpSettings, McpSettingsUpdate } from '@automattic/api-core';
import type { MouseEvent } from 'react';

const MCP_TOOLS_PATH = '/resources/ai-mcp/tools';
const MCP_CONNECT_PATH = '/resources/ai-mcp/connect';

function getReadBadge( abilities: McpAvailableAbility[] ) {
	if ( abilities.length === 0 ) {
		return { text: __( 'No tools available' ) };
	}

	const enabledCount = abilities.filter( ( ability ) => ability.enabled ).length;

	if ( enabledCount === abilities.length ) {
		return { text: __( 'All enabled' ), intent: 'success' as const };
	}

	if ( enabledCount === 0 ) {
		return { text: __( 'None enabled' ) };
	}

	return {
		/* translators: %1$d is the number of enabled tools, %2$d is the total number of tools */
		text: sprintf( __( '%1$d of %2$d enabled' ), enabledCount, abilities.length ),
		intent: 'info' as const,
	};
}

interface McpOverviewProps {
	settings: McpSettings | undefined;
	isLoading?: boolean;
	isSaving?: boolean;
	onSave: ( update: McpSettingsUpdate ) => void;
	recordTracksEvent?: RecordTracksEvent;
	toolsPath?: string;
	connectPath?: string;
	onNavigate?: ( path: string ) => void;
}

export default function McpOverview( {
	settings,
	isLoading,
	isSaving,
	onSave,
	recordTracksEvent = () => {},
	toolsPath = MCP_TOOLS_PATH,
	connectPath = MCP_CONNECT_PATH,
	onNavigate,
}: McpOverviewProps ) {
	const handleNavClick =
		( path: string, eventName: string ) => ( event: MouseEvent< HTMLElement > ) => {
			recordTracksEvent( eventName );
			if ( onNavigate ) {
				event.preventDefault();
				onNavigate( path );
			}
		};

	const availableAbilities = settings?.available_abilities ?? [];
	const mcpEnabled = !! settings?.enabled;

	const onMainToggle = ( next: boolean ) => {
		recordTracksEvent( 'calypso_a4a_ai_mcp_enable_toggled', { enabled: next } );
		onSave( { enabled: next } );
	};

	return (
		<VStack spacing={ 4 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'External AI agent access' ) }
							description={ __(
								'Allow external AI agents to access your Automattic for Agencies account and sites via MCP.'
							) }
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							checked={ mcpEnabled }
							disabled={ isLoading || isSaving }
							label={ __( 'Enable MCP access' ) }
							onChange={ onMainToggle }
						/>
					</VStack>
				</CardBody>

				<CardDivider style={ { borderColor: 'var(--color-border-subtle)' } } />
				<SummaryButton
					density="medium"
					title={ __( 'Read' ) }
					decoration={ <Icon icon={ seen } size={ 24 } /> }
					badges={ [ getReadBadge( availableAbilities ) ] }
					href={ toolsPath }
					disabled={ ! mcpEnabled }
					onClick={ handleNavClick( toolsPath, 'calypso_a4a_ai_mcp_available_tools_click' ) }
				/>
				<SummaryButton
					density="medium"
					title={ __( 'Write' ) }
					decoration={ <Icon icon={ pencil } size={ 24 } /> }
					badges={ [ { text: __( 'Coming soon' ) } ] }
					disabled
				/>
			</Card>

			<SummaryButton
				title={ __( 'Connect external AI assistant' ) }
				description={ __( 'Get instructions for connecting your external AI assistant.' ) }
				decoration={ <Icon icon={ connection } size={ 24 } /> }
				href={ connectPath }
				disabled={ ! mcpEnabled }
				onClick={ handleNavClick( connectPath, 'calypso_a4a_ai_mcp_connect_click' ) }
			/>

			<SummaryButton
				title={ __( 'Starter prompts' ) }
				description={ __( 'Ready-made prompts to copy into your connected assistant.' ) }
				decoration={ <Icon icon={ listView } size={ 24 } /> }
				disabled
			/>
		</VStack>
	);
}
