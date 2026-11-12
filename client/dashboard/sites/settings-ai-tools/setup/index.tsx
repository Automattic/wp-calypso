import { userSettingsQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getSiteLevelEnabled } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import McpSetupInstructions from '../../../me/mcp/setup/instructions';

function SiteAIToolsSetup() {
	const { siteSlug } = useParams( { strict: false } ) as { siteSlug: string };
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const isSiteMcpEnabled = getSiteLevelEnabled( userSettings || {}, site.ID );

	if ( ! isSiteMcpEnabled ) {
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
				<ComponentViewTracker eventName="calypso_dashboard_site_ai_tools_setup_view" />
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ __( 'Setup Required' ) } />
							<VStack spacing={ 4 }>
								<Text as="p" variant="muted">
									{ __( 'MCP access is not enabled for this site.' ) }
								</Text>
								<Text as="p" variant="muted">
									{ __( 'Enable MCP access for this site before connecting your AI agent.' ) }
								</Text>
								<RouterLinkButton
									to={ `/sites/${ siteSlug }/settings/ai-tools` }
									variant="primary"
									className="mcp-setup__action-button"
								>
									{ __( 'Go to Site MCP settings' ) }
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
			<ComponentViewTracker eventName="calypso_dashboard_site_ai_tools_setup_view" />
			<McpSetupInstructions />
		</PageLayout>
	);
}

export default SiteAIToolsSetup;
