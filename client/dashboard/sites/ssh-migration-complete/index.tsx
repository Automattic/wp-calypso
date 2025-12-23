import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import { getAddSiteDomainUrl } from '../../utils/domain-url';

export default function SSHMigrationComplete( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const { recordTracksEvent } = useAnalytics();
	const sourceSiteDomain = site.options?.migration_source_site_domain;
	const siteDomain = sourceSiteDomain?.replace( /^https?:\/\/|\/+$/g, '' );

	const handleGetStarted = () => {
		recordTracksEvent( 'calypso_dashboard_ssh_migration_complete_get_started_click' );
	};

	const handleDoLater = () => {
		recordTracksEvent( 'calypso_dashboard_ssh_migration_complete_do_later_click' );
	};

	const handlePreviewClick = () => {
		recordTracksEvent( 'calypso_dashboard_ssh_migration_complete_preview_click' );
	};

	const previewLink = (
		<ExternalLink href={ `https://${ site.slug }` } onClick={ handlePreviewClick }>
			<strong>{ site.slug }</strong>
		</ExternalLink>
	);

	return (
		<PageLayout size="small">
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
							<SectionHeader title={ __( 'Connect your domain' ) } level={ 3 } />
							<Text as="p" variant="muted">
								{ siteDomain &&
									createInterpolateElement(
										__(
											'You can preview your new site at <siteLink />. Connecting your domain will make it available at <remoteDomain />.'
										),
										{
											siteLink: previewLink,
											remoteDomain: <>{ siteDomain }</>,
										}
									) }
								{ ! siteDomain &&
									createInterpolateElement(
										__( 'You can preview your new site at <siteLink />.' ),
										{
											siteLink: previewLink,
										}
									) }
							</Text>
							<ButtonStack justify="flex-start" expanded={ false }>
								<Button
									variant="primary"
									onClick={ handleGetStarted }
									href={ getAddSiteDomainUrl( site.slug ) }
								>
									{ __( 'Get started' ) }
								</Button>
								<RouterLinkButton
									variant="secondary"
									onClick={ handleDoLater }
									to={ `/sites/${ site.slug }` }
								>
									{ __( 'I’ll do this later' ) }
								</RouterLinkButton>
							</ButtonStack>
						</VStack>
					</CardBody>
				</Card>
			</VStack>
		</PageLayout>
	);
}
