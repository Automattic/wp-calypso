import {
	ToggleControl,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, shield } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { A4A_AI_MCP_AVAILABLE_TOOLS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchMcpSettings from 'calypso/a8c-for-agencies/data/mcp-ai/use-fetch-mcp-settings';
import useUpdateMcpSettingsMutation from 'calypso/a8c-for-agencies/data/mcp-ai/use-update-mcp-settings-mutation';
import { Card, CardBody, CardDivider } from 'calypso/dashboard/components/card';
import DashboardSummaryButton from 'calypso/dashboard/components/summary-button';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';

import '../style.scss';

export default function AiMcpOverviewContent() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { data: settings, isLoading } = useFetchMcpSettings();

	const mutation = useUpdateMcpSettingsMutation( {
		onError: () => {
			dispatch( errorNotice( translate( 'Could not save. Please try again.' ) ) );
		},
	} );

	const onMainToggle = useCallback(
		( next: boolean ) => {
			dispatch( recordTracksEvent( 'calypso_a4a_ai_mcp_enable_toggled', { enabled: next } ) );
			mutation.mutate( { enabled: next } );
		},
		[ dispatch, mutation ]
	);

	const onAvailableToolsClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_ai_mcp_available_tools_click' ) );
	}, [ dispatch ] );

	const availableAbilities = settings?.available_abilities ?? [];
	const enabledCount = availableAbilities.filter( ( a ) => a.enabled ).length;
	const totalCount = availableAbilities.length;
	const mainEnabled = !! settings?.enabled;

	const availableToolsBadge =
		totalCount > 0
			? {
					/* translators: %1$d enabled, %2$d total */
					text: translate( '%1$d of %2$d enabled', {
						args: [ enabledCount, totalCount ],
					} ) as string,
					intent: ( enabledCount > 0 ? 'info' : undefined ) as 'info' | undefined,
			  }
			: { text: translate( 'No tools available' ) as string };

	return (
		<>
			<Spacer className="a4a-ai-mcp-overview__intro" marginBottom={ 12 }>
				<Text size={ 15 }>
					{ preventWidows(
						__( 'Control how AI assistants interact with your Automattic for Agencies account.' )
					) }
				</Text>
			</Spacer>

			<VStack spacing={ 4 }>
				<Card className="a4a-ai-mcp-overview__card">
					<CardBody>
						<VStack spacing={ 3 }>
							<Text weight={ 600 } size={ 15 }>
								{ translate( 'External AI agent access' ) }
							</Text>
							<Text variant="muted">
								{ translate(
									'Allow external AI agents to access your Automattic for Agencies account via MCP.'
								) }
							</Text>
							<ToggleControl
								label={ translate( 'Enable MCP access' ) }
								checked={ mainEnabled }
								onChange={ onMainToggle }
								disabled={ isLoading || mutation.isPending }
								__nextHasNoMarginBottom
							/>
						</VStack>
					</CardBody>
					<CardDivider style={ { borderColor: '#f0f0f0' } } />
					<DashboardSummaryButton
						density="medium"
						title={ translate( 'Available tools' ) }
						decoration={ <Icon icon={ shield } size={ 24 } /> }
						badges={ [ availableToolsBadge ] }
						href={ A4A_AI_MCP_AVAILABLE_TOOLS_LINK }
						onClick={ onAvailableToolsClick }
						disabled={ ! mainEnabled }
					/>
				</Card>
			</VStack>
		</>
	);
}
