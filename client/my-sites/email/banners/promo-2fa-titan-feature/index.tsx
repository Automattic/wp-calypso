import { useTranslate } from 'i18n-calypso';
import Banner from 'calypso/components/banner';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ReactElement } from 'react';

type BannerSetupTitan2faProps = {
	domain: ResponseDomain;
};

export default function BannerPromo2faTitanFeature( {
	domain,
}: BannerSetupTitan2faProps ): ReactElement | null {
	const translate = useTranslate();

	if ( ! hasTitanMailWithUs( domain ) ) {
		return null;
	}

	return (
		<Banner
			title={ translate( 'Professional Email just got safer' ) }
			description={ translate(
				'Two factor authentication is one of the safest ways to protect your account and emails'
			) }
			callToAction={ translate( 'Set up now' ) }
			icon="my-sites"
			horizontal
			href="https://wp.titan.email"
			dismissPreferenceName="email_management_banner_promo_2fa_titan_feature"
			event="calypso_email_management_banner_promo_2fa_titan_feature"
			tracksClickName="calypso_email_management_banner_promo_2fa_titan_feature_click"
			tracksDismissName="calypso_email_management_banner_promo_2fa_titan_feature_dismiss"
			tracksImpressionName="calypso_email_management_banner_promo_2fa_titan_feature_view"
		/>
	);
}
