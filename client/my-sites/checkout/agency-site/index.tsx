import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import { getAgencySiteCheckoutParams } from '../agency-checkout/lib/agency-checkout-params';
import { AgencyCheckoutPlaceholder, AgencyCheckoutShell } from '../agency-checkout/shell';
import CheckoutMain from '../src/components/checkout-main';
import useSitePlanCart from './use-site-plan-cart';

interface Props {
	siteId: number;
	siteSlug: string;
	productSlug: string;
}

/**
 * Launches one of the agency's development sites from the Automattic for
 * Agencies dashboard: the WordPress.com plan for that site, paid on the site's
 * own cart. The site and the plan come from the path; the page to return to
 * after payment and the page the Back link leads to from the query string.
 */
function AgencySiteCheckoutContent( { siteId, siteSlug, productSlug }: Props ) {
	const translate = useTranslate();
	const { term, redirectTo, cancelTo } = useMemo(
		() => getAgencySiteCheckoutParams( window.location.search, siteSlug ),
		[ siteSlug ]
	);
	const { isReady, error } = useSitePlanCart( siteId, productSlug, term );

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
			siteSlug={ siteSlug }
			siteId={ siteId }
		/>
	);
}

export default function AgencySiteCheckout( props: Props ) {
	return (
		<AgencyCheckoutShell>
			<AgencySiteCheckoutContent { ...props } />
		</AgencyCheckoutShell>
	);
}
