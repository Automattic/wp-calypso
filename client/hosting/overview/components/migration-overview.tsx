import { translate } from 'i18n-calypso';
import { HostingCard, HostingCardGrid } from 'calypso/components/hosting-card';
import { HostingHero, HostingHeroButton } from 'calypso/components/hosting-hero';
import { addQueryArgs } from 'calypso/lib/url';
import { getMigrationStatus, getMigrationType } from 'calypso/sites-dashboard/utils';
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
	if ( getMigrationStatus( site ) === 'pending' ) {
		let continueMigrationUrl = 'https://wordpress.com';
		const migrationType = getMigrationType( site );

		const queryArgs = {
			siteId: site.ID,
			siteSlug: site.slug,
			ref: 'hosting-migration-overview',
		};

		// TODO: Fix links. It should also check if the user already purchased a plan to redirect to the proper step in the proper flow.
		switch ( migrationType ) {
			case 'diy':
				continueMigrationUrl = addQueryArgs(
					queryArgs,
					'/setup/migration/migration-how-to-migrate'
				);
				break;
			case 'difm':
				continueMigrationUrl = addQueryArgs(
					queryArgs,
					'/setup/migration/site-migration-credentials'
				);
				break;
			default:
				continueMigrationUrl = addQueryArgs(
					queryArgs,
					'/setup/migration/migration-how-to-migrate'
				);
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
	}
};

export default MigrationOverview;
