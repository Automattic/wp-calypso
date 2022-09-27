import { useTranslate } from 'i18n-calypso';
import Banner from 'calypso/components/banner';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { getDomainsThatCanAddEmailProvider } from 'calypso/lib/emails';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ReactElement } from 'react';

type BannerPromoTitanProps = {
	domains: ResponseDomain[];
	selectedSiteSlug: string;
	currentRoute: string;
};

export default function BannerPromoTitan( {
	domains,
	selectedSiteSlug,
	currentRoute,
}: BannerPromoTitanProps ): ReactElement | null {
	const translate = useTranslate();

	const [ firstDomainWithoutEmailProvider ] = getDomainsThatCanAddEmailProvider( domains );

	if ( ! firstDomainWithoutEmailProvider ) {
		return null;
	}

	const domainName = firstDomainWithoutEmailProvider.name;

	// TODO: use the same banner for email forwarding page
	if (hasEmailForwards( domain )) {
		
	}

	return (
		<Banner
			title={ translate( 'Looking forward to a secure email solution?' ) }
			description={ translate( 'Try Professional Email today for 3 months free' ) }
			callToAction={ translate( 'Try now' ) }
			icon="my-sites"
			horizontal
			href={ emailManagementPurchaseNewEmailAccount( selectedSiteSlug, domainName, currentRoute ) }
			dismissPreferenceName="domain_management_banner_promote_titan_via_2fa"
			event="calypso_domain_management_banner_promote_titan_via_2fa"
			tracksClickName="calypso_domain_management_banner_promote_titan_via_2fa_click"
			tracksDismissName="calypso_domain_management_banner_promote_titan_via_2fa_dismiss"
			tracksImpressionName="calypso_domain_management_banner_promote_titan_via_2fa_view"
		/>
	);
}
