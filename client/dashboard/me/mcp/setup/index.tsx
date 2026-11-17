import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMcpTracksAudienceProps } from '../../../../me/mcp/tracks';
import { hasEnabledAccountTools } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import McpSetupInstructions from './instructions';

function McpSetupComponent() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const tracksAudienceProps = useMcpTracksAudienceProps();

	const hasEnabledTools = hasEnabledAccountTools( userSettings || {} );

	if ( ! hasEnabledTools ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						title={ __( 'Connect AI agent' ) }
						description={ __( 'Get instructions for connecting your AI agent.' ) }
						prefix={ <Breadcrumbs length={ 3 } /> }
					/>
				}
			>
				<ComponentViewTracker
					eventName="calypso_dashboard_mcp_setup_view"
					properties={ tracksAudienceProps }
				/>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ __( 'Setup Required' ) } />
							<VStack spacing={ 4 }>
								<Text as="p" variant="muted">
									{ __( 'No MCP access is currently enabled for your account.' ) }
								</Text>
								<Text as="p" variant="muted">
									{ __(
										'MCP access defines what actions and data your MCP client can access on your account. You need to enable MCP access in the main MCP settings before configuring your client.'
									) }
								</Text>
								<RouterLinkButton
									to="/me/preferences/mcp"
									variant="primary"
									className="mcp-setup__action-button"
								>
									{ __( 'Go to MCP Settings' ) }
								</RouterLinkButton>
							</VStack>
						</VStack>
					</CardBody>
				</Card>
			</PageLayout>
		);
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Connect AI agent' ) }
					description={ __( 'Get instructions for connecting your AI agent.' ) }
					prefix={ <Breadcrumbs length={ 3 } /> }
				/>
			}
		>
			<ComponentViewTracker
				eventName="calypso_dashboard_mcp_setup_view"
				properties={ tracksAudienceProps }
			/>
			<McpSetupInstructions />
		</PageLayout>
	);
}

export default McpSetupComponent;
