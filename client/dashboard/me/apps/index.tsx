import config from '@automattic/calypso-config';
import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import AppsDesktopCard from './apps-desktop-card';
import AppsMobileCard from './apps-mobile-card';

export default function Apps() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'AI & Apps' ) }
					description={ __( 'Connect AI assistants and get WordPress.com apps for your devices.' ) }
				/>
			}
		>
			<VStack spacing={ 8 }>
				{ config.isEnabled( 'mcp-settings' ) && (
					<VStack spacing={ 4 }>
						<RouterLinkSummaryButton
							to="/me/apps/agent"
							title={ __( 'WordPress Agent' ) }
							description={ __( 'Connect WordPress Agent to apps you already use.' ) }
							decoration={ <BigSkyLogo.CentralLogo heartless size={ 24 } /> }
						/>
					</VStack>
				) }
				<AppsMobileCard />
				<AppsDesktopCard appSlug="wordpress" />
				<AppsDesktopCard appSlug="studio" />
			</VStack>
		</PageLayout>
	);
}
