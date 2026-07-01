import {
	Icon,
	ToggleControl,
	__experimentalHStack as HStack,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import clsx from 'clsx';
import { Card, CardBody } from '../../../components/card';
import SummaryButton from '../../../components/summary-button';
import type { RecordTracksEvent } from './types';
import type { McpSettings, McpSettingsUpdate } from '@automattic/api-core';
import type { MouseEvent } from 'react';

import './style.scss';

const MCP_TOOLS_PATH = '/resources/ai-mcp/tools';
const MCP_CONNECT_PATH = '/resources/ai-mcp/connect';

function StepNumber( { n, completed }: { n: number; completed?: boolean } ) {
	return (
		<span
			className={ clsx( 'mcp-overview__step-number', { 'is-completed': completed } ) }
			aria-hidden="true"
		>
			{ completed ? <Icon icon={ check } size={ 18 } /> : n }
		</span>
	);
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
					{ __(
						'Set up AI agent access in three steps. Access won’t work until you complete all three.'
					) }
				</Text>
			</Spacer>

			<VStack spacing={ 4 }>
				<Card>
					<CardBody>
						<HStack alignment="flex-start" justify="space-between" spacing={ 4 }>
							<HStack
								className="mcp-overview__step-heading"
								alignment="flex-start"
								justify="flex-start"
								spacing={ 3 }
							>
								<StepNumber n={ 1 } completed={ mainEnabled } />
								<VStack spacing={ 1 }>
									<Text weight={ 600 } size={ 15 }>
										{ __( 'Enable MCP access' ) }
									</Text>
									<Text variant="muted">
										{ __(
											'Allow external AI agents to access your Automattic for Agencies account via MCP.'
										) }
									</Text>
								</VStack>
							</HStack>
							<ToggleControl
								__nextHasNoMarginBottom
								label=""
								aria-label={ __( 'Enable MCP access' ) }
								checked={ mainEnabled }
								onChange={ onMainToggle }
								disabled={ isLoading || isSaving }
							/>
						</HStack>
					</CardBody>
				</Card>

				<SummaryButton
					title={ __( 'Select tools' ) }
					description={ __( 'Choose what AI agents can do in your account.' ) }
					decoration={ <StepNumber n={ 2 } /> }
					badges={ [ availableToolsBadge ] }
					href={ toolsPath }
					disabled={ ! mainEnabled }
					onClick={ handleNavClick( toolsPath, 'calypso_a4a_ai_mcp_available_tools_click' ) }
				/>

				<SummaryButton
					title={ __( 'Connect your AI agent' ) }
					description={ __(
						'Required — add the MCP connection to your AI agent to finish setup.'
					) }
					decoration={ <StepNumber n={ 3 } /> }
					href={ connectPath }
					disabled={ ! mainEnabled }
					onClick={ handleNavClick( connectPath, 'calypso_a4a_ai_mcp_connect_click' ) }
				/>
			</VStack>
		</>
	);
}
