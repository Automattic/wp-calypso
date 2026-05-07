import { isFreePlan } from '@automattic/calypso-products';
import { Button, Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import PromoSection, { type Props as PromoSectionProps } from 'calypso/components/promo-section';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordEmailUpsellTracksEvent } from 'calypso/my-sites/email/email-management/home/utils';
import { useSelector } from 'calypso/state';
import { hasDomainCredit } from 'calypso/state/sites/plans/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

import './email-no-domain.scss';

const EmailNoDomain = ( {
	selectedSite,
	source,
}: {
	selectedSite: SiteDetails;
	source: string;
} ) => {
	const translate = useTranslate();

	const hasAvailableDomainCredit = useSelector( ( state: AppState ) =>
		hasDomainCredit( state, selectedSite.ID )
	);

	const isFreePlanProduct = isFreePlan( selectedSite?.plan?.product_slug ?? '' );

	const trackEventForPlan = () => {
		recordEmailUpsellTracksEvent( source, 'plan' );
	};

	const trackEventForDomain = () => {
		recordEmailUpsellTracksEvent( source, 'domain' );
	};

	const trackImpression = ( noDomainContext: string ) => {
		// This is executed multiple times by different conditionals as the site states get set.
		// Particularly, `hasAvailableDomainCredit` takes some time to be returned.
		// To ensure we are tracking the proper values, only make a tracking request when all states are set.
		if ( isFreePlanProduct === null || hasAvailableDomainCredit === null ) {
			return '';
		}

		const noDomainSource = source || 'email';

		return (
			<TrackComponentView
				eventName="calypso_email_management_no_domain"
				eventProperties={ {
					context: noDomainContext,
					source: noDomainSource,
				} }
			/>
		);
	};

	if ( isFreePlanProduct ) {
		const promos: PromoSectionProps = {
			promos: [
				{
					title: (
						<>
							<Gridicon icon="globe" />
							{ translate( 'Look professional' ) }
						</>
					),
					body: translate(
						'A custom email address like hello@yourdomain.com tells customers you mean business and reinforces your brand on every send.'
					),
				},
				{
					title: (
						<>
							<Gridicon icon="checkmark-circle" />
							{ translate( 'Build trust' ) }
						</>
					),
					body: translate(
						'Leave generic email addresses behind and project a confident, trust-building image to everyone who gets in touch.'
					),
				},
				{
					title: (
						<>
							<Gridicon icon="cloud" />
							{ translate( '30 GB storage' ) }
						</>
					),
					body: translate(
						'The most space, for the best value. Never run out of room for what matters.'
					),
				},
				{
					title: (
						<>
							<Gridicon icon="lock" />
							{ translate( 'Advanced security' ) }
						</>
					),
					body: translate(
						'Data encryption, spam, and virus protection keep your inbox safe out of the box, with 99.98% uptime.'
					),
				},
				{
					title: (
						<>
							<Gridicon icon="clipboard" />
							{ translate( 'Get more done' ) }
						</>
					),
					body: translate(
						'Templates, scheduled sending, reminders, and advanced search help you power through your day.'
					),
				},
				{
					title: (
						<>
							<Gridicon icon="sync" />
							{ translate( 'Migrate seamlessly' ) }
						</>
					),
					body: translate(
						'Bring your emails and contacts with you. The built-in migration tool pulls your old account data into your new inbox in a few clicks.'
					),
				},
			],
		};

		return (
			<div className="email-no-domain__landing">
				<Card className="email-no-domain__hero">
					<div className="email-no-domain__hero-info">
						<h1 className="email-no-domain__hero-title">
							{ translate( 'Stand out with Professional Email' ) }
						</h1>
						<h2 className="email-no-domain__hero-description">
							{ translate(
								'Build and grow your online presence with a custom domain and personalized email address from WordPress.com.'
							) }
						</h2>
						<div className="email-no-domain__hero-buttons">
							<Button
								primary
								href={ `/plans/${ selectedSite.slug }` }
								onClick={ trackEventForPlan }
							>
								{ translate( 'Upgrade' ) }
							</Button>
							<Button
								href={ `/domains/add/${ selectedSite.slug }` }
								onClick={ trackEventForDomain }
							>
								{ translate( 'Search for a domain' ) }
							</Button>
						</div>
					</div>
					<div className="email-no-domain__hero-image-wrapper">
						<img
							className="email-no-domain__hero-image"
							src={ emailIllustration }
							alt=""
							role="presentation"
						/>
					</div>
					{ trackImpression( 'plan' ) }
				</Card>
				<div className="email-no-domain__features-section">
					<FormattedHeader
						brandFont
						headerText={ translate( 'Everything you need to communicate like a pro' ) }
						align="center"
					/>
					<PromoSection { ...promos } />
				</div>
			</div>
		);
	}

	if ( hasAvailableDomainCredit ) {
		return (
			<EmptyContent
				action={ translate( 'Add a Domain' ) }
				actionCallback={ trackEventForDomain }
				actionURL={ `/domains/add/${ selectedSite.slug }` }
				line={ translate(
					'Claim your domain, pick from one of our flexible options to connect your domain with email and start getting emails today.'
				) }
				title={ translate( 'Claim your free domain to use with a custom email address' ) }
			>
				{ trackImpression( 'domain' ) }
			</EmptyContent>
		);
	}

	return (
		<EmptyContent
			action={ translate( 'Add a Domain' ) }
			actionURL={ `/domains/add/${ selectedSite.slug }` }
			actionCallback={ trackEventForDomain }
			line={ translate(
				'Set up or buy your domain, pick from one of our flexible email options, and start getting emails today.'
			) }
			title={ translate( 'Set up a domain to use with a custom email address' ) }
		>
			{ trackImpression( 'domain' ) }
		</EmptyContent>
	);
};

export default EmailNoDomain;
