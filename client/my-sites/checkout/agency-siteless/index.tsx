import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import { getAgencyCheckoutParams } from '../agency-checkout/lib/agency-checkout-params';
import { AgencyCheckoutPlaceholder, AgencyCheckoutShell } from '../agency-checkout/shell';
import CheckoutMain from '../src/components/checkout-main';
import useAgencyCart from './use-agency-cart';

/**
 * An agency's own purchases from the Automattic for Agencies dashboard, paid
 * on WordPress.com without a site the way the client referral checkout is.
 * The cart, the page to return to after payment and the page the Back link
 * leads to arrive in the query string. The agency is the one of the user who is
 * logged in.
 */
function AgencySitelessCheckoutContent() {
	const translate = useTranslate();
	const { entries, term, redirectTo, cancelTo } = useMemo(
		() => getAgencyCheckoutParams( window.location.search ),
		[]
	);
	const { isReady, error } = useAgencyCart( entries, term );

	if ( error ) {
		return <EmptyContent title={ translate( 'Error' ) } line={ error } />;
	}

	if ( ! isReady ) {
		return <AgencyCheckoutPlaceholder />;
	}

	return (
		<CheckoutMain
			sitelessCheckoutType="a4a"
			redirectTo={ redirectTo }
			customizedPreviousPath={ cancelTo }
			siteSlug=""
			siteId={ 0 }
		/>
	);
}

export default function AgencySitelessCheckout() {
	return (
		<AgencyCheckoutShell>
			<AgencySitelessCheckoutContent />
		</AgencyCheckoutShell>
	);
}
