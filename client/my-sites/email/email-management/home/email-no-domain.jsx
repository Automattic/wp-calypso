import { isFreePlan } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Illustration from 'calypso/assets/images/customer-home/illustration--task-find-domain.svg';
import EmptyContent from 'calypso/components/empty-content';
import { recordInboxUpsellEvent } from 'calypso/my-sites/email/email-management/home/utils';
import { hasDomainCredit } from 'calypso/state/sites/plans/selectors';

const EmailNoDomain = ( { selectedSite, translate, context } ) => {
	const hasAvailableDomainCredit = useSelector( ( state ) =>
		hasDomainCredit( state, selectedSite.ID )
	);

	const trackEvent =
		context != null
			? () => {
					recordInboxUpsellEvent( { product: 'domain', context } );
			  }
			: () => {};

	if ( isFreePlan( selectedSite.plan.product_slug ) ) {
		return (
			<EmptyContent
				action={ translate( 'Upgrade', { context: 'verb' } ) }
				actionCallback={ trackEvent }
				actionURL={ `/plans/${ selectedSite.slug }` }
				illustration={ Illustration }
				line={ translate(
					'Upgrade now, set up your domain and pick from one of our flexible options to connect your domain with email and start getting emails today.'
				) }
				title={ translate( 'Get your own domain for a custom email address' ) }
			/>
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
			/>
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
		/>
	);
};

EmailNoDomain.propTypes = {
	// Props passed to this component
	context: PropTypes.string,
	selectedSite: PropTypes.object.isRequired,

	// Props injected via localize()
	translate: PropTypes.func.isRequired,
};

export default localize( EmailNoDomain );
