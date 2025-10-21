import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { HostingCard } from 'calypso/components/hosting-card';
import { HostingHeroButton } from 'calypso/components/hosting-hero';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToDomain } from 'calypso/lib/url';
import { Container, Header } from './layout';
import type { SiteDetails } from '@automattic/data-stores';

export const MigrationSSHComplete = ( { site }: { site: SiteDetails } ) => {
	const translate = useTranslate();
	const sourceSiteDomain = site?.options?.migration_source_site_domain
		? urlToDomain( site.options.migration_source_site_domain )
		: 'yourwebsite.com';

	const title = translate( 'Welcome to your new home 🎉' );
	const subTitle = translate(
		'Your site is now living happily on WordPress.com. Complete the migration by connecting your domain.'
	);

	const handleGetStarted = () => {
		recordTracksEvent( 'calypso_migration_ssh_complete_get_started_click' );
		// TODO: Navigate to domain connection flow
		window.location.href = `/domains/add/${ site.slug }`;
	};

	const handleDoLater = () => {
		recordTracksEvent( 'calypso_migration_ssh_complete_do_later_click' );
		window.location.href = `/sites/${ site.slug }`;
	};

	const handlePreviewClick = () => {
		recordTracksEvent( 'calypso_migration_ssh_complete_preview_click' );
	};

	const cardContent = (
		<div className="migration-ssh-complete__card-content">
			<p>
				{ translate(
					'You can preview your new site at {{previewLink}}%(stagingUrl)s{{/previewLink}}. Connecting your domain will make it available at %(siteDomain)s.',
					{
						components: {
							previewLink: (
								<a
									href={ `https://${ site.slug }` }
									target="_blank"
									rel="noopener noreferrer"
									onClick={ handlePreviewClick }
								>
									{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
									<span className="external-link-icon">↗</span>
								</a>
							),
						},
						args: {
							stagingUrl: site.slug,
							siteDomain: sourceSiteDomain,
						},
					}
				) }
			</p>
			<div className="migration-ssh-complete__buttons">
				<HostingHeroButton onClick={ handleGetStarted }>
					{ translate( 'Get started' ) }
				</HostingHeroButton>
				<Button variant="secondary" className="hosting-hero-button" onClick={ handleDoLater }>
					{ translate( "I'll do this later" ) }
				</Button>
			</div>
		</div>
	);

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle } />
			<div className="migration-ssh-complete__card-wrapper">
				<HostingCard title={ translate( 'Connect your domain' ) }>{ cardContent }</HostingCard>
			</div>
		</Container>
	);
};
