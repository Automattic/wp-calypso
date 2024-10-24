import { canInstallPlugins } from '@automattic/sites';
import { translate } from 'i18n-calypso';
import { HostingCard, HostingCardGrid } from 'calypso/components/hosting-card';
import { HostingHero, HostingHeroButton } from 'calypso/components/hosting-hero';
import { addQueryArgs } from 'calypso/lib/url';
import { getMigrationType } from 'calypso/sites-dashboard/utils';
import type { SiteDetails } from '@automattic/data-stores';

const cards = [
	{
		title: translate( 'Seriously secure' ),
		text: translate(
			'Firewalls, encryption, brute force, and DDoS protection. Your security’s all taken care of so you can stay one step ahead of any threats.'
		),
	},
	{
		title: translate( 'Unmetered bandwidth' ),
		text: translate(
			'With 99.999% uptime and entirely unmetered bandwidth and traffic on every plan, you’ll never need to worry about being too successful.'
		),
	},
	{
		title: translate( 'Power, meet performance' ),
		text: translate(
			'Our custom 28+ location CDN and 99.999% uptime ensure your site is always fast and always available from anywhere in the world.'
		),
	},
	{
		title: translate( 'Plugins, themes, and custom code' ),
		text: translate(
			'Build anything with full support and automatic updates for 50,000+ plugins and themes. Or start from scratch with your own custom code.'
		),
	},
	{
		title: translate( 'Expert support' ),
		text: translate(
			'Whenever you’re stuck, whatever you’re trying to make happen – our Happiness Engineers have the answers.'
		),
	},
];

const MigrationOverview = ( { site }: { site: SiteDetails } ) => {
	const migrationType = getMigrationType( site );

	const baseQueryArgs = {
		siteId: site.ID,
		siteSlug: site.slug,
		start: 'true',
		ref: 'hosting-migration-overview',
	};

	let continueMigrationUrl;

	if ( ! canInstallPlugins( site ) ) {
		// For the flows where the checkout is after the choice.
		switch ( migrationType ) {
			case 'diy':
				continueMigrationUrl = addQueryArgs(
					{
						...baseQueryArgs,
						destination: 'upgrade',
						how: 'myself',
					},
					'/setup/site-migration/site-migration-upgrade-plan'
				);
				break;
			case 'difm':
				continueMigrationUrl = addQueryArgs(
					{
						...baseQueryArgs,
						destination: 'upgrade',
						how: 'difm',
					},
					'/setup/site-migration/site-migration-upgrade-plan'
				);
				break;
			default:
				continueMigrationUrl = addQueryArgs(
					baseQueryArgs,
					'/setup/site-migration/site-migration-how-to-migrate'
				);
		}
	} else {
		// For the /setup/migration, where the checkout is before the choice.
		switch ( migrationType ) {
			case 'diy':
				continueMigrationUrl = addQueryArgs(
					baseQueryArgs,
					'/setup/migration/site-migration-instructions'
				);
				break;
			case 'difm':
				continueMigrationUrl = addQueryArgs(
					baseQueryArgs,
					'/setup/migration/site-migration-credentials'
				);
				break;
			default:
				continueMigrationUrl = addQueryArgs(
					baseQueryArgs,
					'/setup/migration/migration-how-to-migrate'
				);
		}
	}

	return (
		<div>
			<HostingHero>
				<h1>{ translate( 'Your WordPress site is ready to be migrated' ) }</h1>
				<p>
					{ translate(
						'Start your migration today and get ready for unmatched WordPress hosting.'
					) }
				</p>
				<HostingHeroButton href={ continueMigrationUrl }>
					{ translate( 'Start your migration' ) }
				</HostingHeroButton>
			</HostingHero>
			<HostingCardGrid>
				{ cards.map( ( { title, text } ) => (
					<HostingCard inGrid key={ title } title={ title }>
						<p>{ text }</p>
					</HostingCard>
				) ) }
			</HostingCardGrid>
		</div>
	);
};

export default MigrationOverview;
