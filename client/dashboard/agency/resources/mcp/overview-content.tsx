import {
	Icon,
	ToggleControl,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { plugins, tool } from '@wordpress/icons';
import { Card, CardBody, CardDivider } from '../../../components/card';
import SummaryButton from '../../../components/summary-button';
import type { RecordTracksEvent } from './types';
import type { McpSettings, McpSettingsUpdate } from '@automattic/api-core';
import type { MouseEvent } from 'react';

const MCP_TOOLS_PATH = '/resources/ai-mcp/tools';
const MCP_CONNECT_PATH = '/resources/ai-mcp/connect';

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
	const enabledCount = availableAbilities.filter( ( ability ) => ability.enabled ).length;
	const totalCount = availableAbilities.length;
	const mainEnabled = !! settings?.enabled;

	const onMainToggle = ( next: boolean ) => {
		recordTracksEvent( 'calypso_a4a_ai_mcp_enable_toggled', { enabled: next } );
		onSave( { enabled: next } );
	};

	const availableToolsBadge =
		totalCount > 0
			? {
					/* translators: %(enabledCount)d enabled, %(totalCount)d total */
					text: sprintf( __( '%(enabledCount)d of %(totalCount)d enabled' ), {
						enabledCount,
						totalCount,
					} ) as string,
					intent: ( enabledCount > 0 ? 'info' : undefined ) as 'info' | undefined,
			  }
			: { text: __( 'No tools available' ) as string };

	return (
		<>
			<Spacer marginBottom={ 8 } style={ { maxWidth: '650px' } }>
				<Text size={ 15 }>
					{ __( 'Control how AI assistants interact with your Automattic for Agencies account.' ) }
				</Text>
			</Spacer>

			<VStack spacing={ 4 }>
				<Card>
					<CardBody>
						<VStack spacing={ 3 }>
							<Text weight={ 600 } size={ 15 }>
								{ __( 'External AI agent access' ) }
							</Text>
							<Text variant="muted">
								{ __(
									'Allow external AI agents to access your Automattic for Agencies account via MCP.'
								) }
							</Text>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __( 'Enable MCP access' ) }
								checked={ mainEnabled }
								onChange={ onMainToggle }
								disabled={ isLoading || isSaving }
							/>
						</VStack>
					</CardBody>
					{ mainEnabled && (
						<>
							<CardDivider style={ { borderColor: 'var(--color-neutral-5)' } } />
							<SummaryButton
								density="medium"
								title={ __( 'Available tools' ) }
								decoration={ <Icon icon={ tool } size={ 24 } /> }
								badges={ [ availableToolsBadge ] }
								href={ toolsPath }
								onClick={ handleNavClick( toolsPath, 'calypso_a4a_ai_mcp_available_tools_click' ) }
							/>
						</>
					) }
				</Card>

				{ mainEnabled && (
					<SummaryButton
						title={ __( 'Connect external AI assistant' ) }
						description={ __( 'Get instructions for connecting your external AI assistant.' ) }
						decoration={ <Icon icon={ plugins } size={ 24 } /> }
						href={ connectPath }
						onClick={ handleNavClick( connectPath, 'calypso_a4a_ai_mcp_connect_click' ) }
					/>
				) }
			</VStack>
		</>
	);
}
