import { isFreePlan } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Illustration from 'calypso/assets/images/domains/domain.svg';
import EmptyContent from 'calypso/components/empty-content';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { addQueryArgs } from 'calypso/lib/url';
import { recordEmailUpsellTracksEvent } from 'calypso/my-sites/email/email-management/home/utils';
import { useSelector } from 'calypso/state';
import { hasDomainCredit } from 'calypso/state/sites/plans/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

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

	if ( hasAvailableDomainCredit ) {
		return (
			<EmptyContent
				action={ translate( 'Add a Domain' ) }
				actionCallback={ trackEventForDomain }
				actionURL={ `/domains/add/${ selectedSite.slug }` }
				illustration={ Illustration }
				line={ translate(
					'Claim your domain, pick from one of our flexible options to connect your domain with email and start getting emails today.'
				) }
				title={ translate( 'Claim your free domain to use with a custom email address' ) }
			>
				{ trackImpression( 'domain' ) }
			</EmptyContent>
		);
	}

	if ( isFreePlanProduct ) {
		return (
			<>
				<h1>Stand out with Profressional Email</h1>
				<p>
					Build and grow your online presence with a custom domain and a personalized email address.
				</p>

				<h2>Try it free for 3 months</h2>
				<ol>
					<li>
						<span>Choose a domain</span>
						Select a domain that fits your brand.
					</li>
					<li>
						<span>Create a Mailbox</span>
						Add Professional Email powered by Titan or Google Workspace to set up your addresses.
					</li>
					<li>
						<span>Checkout</span>
						Complete your purchase and start using your email!
					</li>
				</ol>

				<Button
					onClick={ trackEventForPlan }
					href={ addQueryArgs(
						{
							redirect_to: `/email/${ selectedSite.slug }`,
						},
						`/domains/add/${ selectedSite.slug }`
					) }
				>
					Get Started
				</Button>
			</>

			// <EmptyContent
			// 	action={ translate( 'Buy a domain and email' ) }
			// 	actionCallback={ trackEventForPlan }
			// 	actionURL=
			// 	illustration={ Illustration }
			// 	line={ translate(
			// 		'Choose a domain and set up a custom email address that truly represents you.'
			// 	) }
			// 	title={ translate( 'Get your own domain for a custom email address' ) }
			// >
			// 	{ trackImpression( 'plan' ) }
			// </EmptyContent>
		);
	}

	return (
		<EmptyContent
			action={ translate( 'Get a domain' ) }
			actionCallback={ trackEventForPlan }
			actionURL={ `/plans/${ selectedSite.slug }` }
			secondaryAction={ translate( 'Use a domain I own' ) }
			secondaryActionCallback={ trackEventForDomain }
			secondaryActionURL={ `/domains/add/${ selectedSite.slug }` }
			illustration={ Illustration }
			line={ translate(
				'Get a domain, or use one you already own, to set up a custom email address that truly represents you'
			) }
			title={ translate( 'Get your own domain for a custom email address' ) }
		>
			{ trackImpression( 'plan' ) }
		</EmptyContent>
	);

	return (
		<EmptyContent
			action={ translate( 'Add a Domain' ) }
			actionURL={ `/domains/add/${ selectedSite.slug }` }
			actionCallback={ trackEventForDomain }
			illustration={ Illustration }
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
