import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import { Text } from '../../components/text';
import type { Site } from '@automattic/api-core';

export function SSHMigrationCompleteContentInfo( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();
	const sourceSiteDomain = site.options?.migration_source_site_domain;
	const siteDomain = sourceSiteDomain?.replace( /^https?:\/\/|\/+$/g, '' ) || 'yourwebsite.com';
	const stagingUrl = `${ site.slug }.wpcomstaging.com`;

	const handleGetStarted = () => {
		recordTracksEvent( 'calypso_dashboard_ssh_migration_complete_get_started_click' );
		// TODO: Navigate to domain connection flow
		window.location.href = `/domains/add/${ site.slug }`;
	};

	const handleDoLater = () => {
		recordTracksEvent( 'calypso_dashboard_ssh_migration_complete_do_later_click' );
		// TODO: Navigate to site overview
		window.location.href = `/sites/${ site.slug }`;
	};

	const handlePreviewClick = () => {
		recordTracksEvent( 'calypso_dashboard_ssh_migration_complete_preview_click' );
	};

	return (
		<VStack spacing={ 8 }>
			<PageHeader
				title={ __( 'Welcome to your new home 🎉' ) }
				description={ __(
					'Your site is now living happily on WordPress.com. Complete the migration by connecting your domain.'
				) }
			/>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Text as="h2" size="20px" weight={ 500 } lineHeight="28px">
							{ __( 'Connect your domain' ) }
						</Text>
						<Text as="p" variant="muted">
							{ createInterpolateElement(
								/* translators: %1$s is the staging URL, %2$s is the site domain */
								__(
									'You can preview your new site at <a>%1$s</a>. Connecting your domain will make it available at %2$s.'
								)
									.replace( '%1$s', stagingUrl )
									.replace( '%2$s', siteDomain ),
								{
									a: (
										<a
											href={ `https://${ stagingUrl }` }
											target="_blank"
											rel="noopener noreferrer"
											onClick={ handlePreviewClick }
										/>
									),
								}
							) }
						</Text>
						<HStack justify="flex-start" spacing={ 2 }>
							<ButtonStack justify="flex-start" expanded={ false }>
								<Button variant="primary" onClick={ handleGetStarted }>
									{ __( 'Get started' ) }
								</Button>
								<Button variant="secondary" onClick={ handleDoLater }>
									{ __( "I'll do this later" ) }
								</Button>
							</ButtonStack>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
