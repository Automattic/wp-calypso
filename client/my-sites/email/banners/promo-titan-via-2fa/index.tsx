import { useTranslate } from 'i18n-calypso';
import Banner from 'calypso/components/banner';
import { getDomainsThatCanAddEmailProvider } from 'calypso/lib/emails';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ReactElement } from 'react';

type BannerPromoTitanVia2faProps = {
	domains: ResponseDomain[];
	selectedSiteSlug: string;
	currentRoute: string;
};

export default function BannerPromoTitanVia2fa( {
	domains,
	selectedSiteSlug,
	currentRoute,
}: BannerPromoTitanVia2faProps ): ReactElement | null {
	const translate = useTranslate();

	const [ firstDomainWithoutEmailProvider ] = getDomainsThatCanAddEmailProvider( domains );

	if ( ! firstDomainWithoutEmailProvider ) {
		return null;
	}

	const domainName = firstDomainWithoutEmailProvider.name;

	return (
		<Banner
			title={ translate( 'Buy titan for %(domainName)s since it already has 2fa :)', {
				args: { domainName },
			} ) }
			description={ translate( 'Lorem ipsum' ) }
			callToAction={ translate( 'Buy' ) }
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
