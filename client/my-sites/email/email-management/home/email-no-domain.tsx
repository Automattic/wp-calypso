import { isFreePlan } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Illustration from 'calypso/assets/images/domains/domain.svg';
import EmptyContent from 'calypso/components/empty-content';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordEmailUpsellTracksEvent } from 'calypso/my-sites/email/email-management/home/utils';
import { hasDomainCredit } from 'calypso/state/sites/plans/selectors';
import { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { AppState } from 'calypso/types';

const EmailNoDomain = ( {
	selectedSite,
	translate,
	source
} : {
	selectedSite: SiteData,
	translate: Function,
	source: string
} ) => {
	const hasAvailableDomainCredit = useSelector( ( state: AppState ) => {
		hasDomainCredit( state, selectedSite.ID );
	}
	);

	const isFreePlanProduct = isFreePlan( selectedSite?.plan?.product_slug ?? null );

	const trackEvent = () => {
		recordEmailUpsellTracksEvent( source, isFreePlanProduct ? 'plan' : 'domain' );
	};

	const trackImpression = ( noDomainContext: string ) => {
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
				actionCallback={ trackEvent }
				actionURL={ `/plans/${ selectedSite.slug }` }
				illustration={ Illustration }
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
				actionCallback={ trackEvent }
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

	return (
		<EmptyContent
			action={ translate( 'Add a Domain' ) }
			actionURL={ `/domains/add/${ selectedSite.slug }` }
			actionCallback={ trackEvent }
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

EmailNoDomain.propTypes = {
	// Props passed to this component
	selectedSite: PropTypes.object.isRequired,
	source: PropTypes.string,

	// Props injected via localize()
	translate: PropTypes.func.isRequired,
};

export default localize( EmailNoDomain );
