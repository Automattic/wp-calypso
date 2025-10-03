import { isFreePlan } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
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

	if ( isFreePlanProduct ) {
		return (
			<EmptyContent
				action={ translate( 'Upgrade to a plan' ) }
				actionCallback={ trackEventForPlan }
				actionURL={ `/plans/${ selectedSite.slug }` }
				secondaryAction={ translate( 'Just search for a domain' ) }
				secondaryActionCallback={ trackEventForDomain }
				secondaryActionURL={ `/domains/add/${ selectedSite.slug }` }
				line={ translate(
					'Upgrade to a plan now, set up your domain and pick from one of our flexible options to connect your domain with email and start getting emails today.'
				) }
				title={ translate( 'Get your own domain for a custom email address' ) }
			>
				{ trackImpression( 'plan' ) }
			</EmptyContent>
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
