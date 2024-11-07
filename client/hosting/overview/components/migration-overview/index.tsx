import { globe, group, Icon, scheduled } from '@wordpress/icons';
import { translate, useTranslate } from 'i18n-calypso';
import { HostingCard, HostingCardGrid } from 'calypso/components/hosting-card';
import { HostingHero, HostingHeroButton } from 'calypso/components/hosting-hero';
import { addQueryArgs } from 'calypso/lib/url';
import { getMigrationStatus, getMigrationType } from 'calypso/sites-dashboard/utils';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactNode } from 'react';
import './style.scss';

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

const getContinueMigrationUrl = ( site: SiteDetails ): string | null => {
	const migrationType = getMigrationType( site );

	const baseQueryArgs = {
		siteId: site.ID,
		siteSlug: site.slug,
		ref: 'hosting-migration-overview',
	};

	if ( migrationType === 'diy' ) {
		return addQueryArgs(
			baseQueryArgs,
			'/setup/hosted-site-migration/site-migration-instructions'
		);
	}

	return addQueryArgs( baseQueryArgs, '/setup/hosted-site-migration/site-migration-credentials' );
};

const Container = ( { children }: { children: ReactNode } ) => {
	return (
		<div className="migration-overview__container">
			<div className="migration-overview__content">{ children }</div>
		</div>
	);
};

const Header = ( {
	title,
	subTitle,
	children,
}: {
	title: string;
	subTitle: string | ReturnType< typeof translate >;
	children?: ReactNode;
} ) => {
	return (
		<HostingHero className="migration-overview__header">
			<h1>{ title }</h1>
			<p>{ subTitle }</p>
			{ children }
		</HostingHero>
	);
};

const MigrationStartedDIFM = ( { site }: { site?: SiteDetails } ) => {
	const translate = useTranslate();
	const title = translate( 'Your migration is underway' );
	const subTitle = translate(
		'Sit back as {{strong}}%(siteName)s{{/strong}} transfers to its new home. Here’s what you can expect.',
		{
			components: { strong: <strong /> },
			args: { siteName: site?.name ?? translate( 'your site' ) },
		}
	) as string;

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle } />
			<div className="migration-started-difm">
				<h2 className="migration-started-difm__title">{ translate( 'What to expect' ) }</h2>
				<ul className="migration-started-difm__list">
					<li className="migration-started-difm__item">
						<div className="migration-started-difm__icon-wrapper">
							<Icon icon={ group } className="migration-started-difm__icon" size={ 30 } />
						</div>
						<span>
							{ translate(
								'We’ll bring over a copy of your site, without affecting the current live version.'
							) }
						</span>
					</li>
					<li className="migration-started-difm__item">
						<div className="migration-started-difm__icon-wrapper">
							<Icon icon={ scheduled } className="migration-started-difm__icon" size={ 30 } />
						</div>
						<span>
							{ translate(
								'You’ll get an update on the progress of your migration within 2-3 business days.'
							) }
						</span>
					</li>
					<li className="migration-started-difm__item">
						<div className="migration-started-difm__icon-wrapper">
							<Icon icon={ globe } className="migration-started-difm__icon" size={ 30 } />
						</div>
						<span>
							{ translate(
								'We’ll help you switch your domain over after the migration’s completed.'
							) }
						</span>
					</li>
				</ul>
			</div>
		</Container>
	);
};

const MigrationStartedDIY = ( { site }: { site: SiteDetails } ) => {
	const title = translate( 'Your migration is underway' );
	const subTitle = translate(
		'Sit back as {{strong}}%(siteName)s{{/strong}} transfers to its new home. Get ready for unmatched WordPress hosting.',
		{
			components: { strong: <strong /> },
			args: { siteName: site.name ?? translate( 'your site' ) },
		}
	) as string;

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle } />

			<HostingCardGrid>
				{ cards.map( ( { title, text } ) => (
					<HostingCard inGrid key={ title } title={ title }>
						<p>{ text }</p>
					</HostingCard>
				) ) }
			</HostingCardGrid>
		</Container>
	);
};

const MigrationPending = ( { site }: { site: SiteDetails } ) => {
	const continueMigrationUrl = getContinueMigrationUrl( site );
	const title = translate( 'Your WordPress site is ready to be migrated' );
	const subTitle = translate(
		'Start your migration today and get ready for unmatched WordPress hosting.'
	);

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle }>
				{ continueMigrationUrl && (
					<HostingHeroButton href={ continueMigrationUrl }>
						{ translate( 'Start your migration' ) }
					</HostingHeroButton>
				) }
			</Header>

			<HostingCardGrid>
				{ cards.map( ( { title, text } ) => (
					<HostingCard inGrid key={ title } title={ title }>
						<p>{ text }</p>
					</HostingCard>
				) ) }
			</HostingCardGrid>
		</Container>
	);
};

const MigrationOverview = ( { site }: { site: SiteDetails } ) => {
	const migrationType = getMigrationType( site );
	const migrationStatus = getMigrationStatus( site );
	const isPending = 'pending' === migrationStatus;

	if ( isPending ) {
		return <MigrationPending site={ site } />;
	}

	if ( migrationType === 'difm' ) {
		return <MigrationStartedDIFM site={ site } />;
	}

	if ( migrationType === 'diy' ) {
		return <MigrationStartedDIY site={ site } />;
	}
};

export default MigrationOverview;
