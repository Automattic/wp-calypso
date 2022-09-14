import { useTranslate } from 'i18n-calypso';
import Banner from 'calypso/components/banner';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ReactElement } from 'react';

type BannerSetupTitan2faProps = {
	domain: ResponseDomain;
};

export default function BannerSetupTitan2fa( {
	domain,
}: BannerSetupTitan2faProps ): ReactElement | null {
	const translate = useTranslate();

	if ( ! hasTitanMailWithUs( domain ) ) {
		return null;
	}

	return (
		<Banner
			title={ translate(
				'Professional Email 2FA (Two-Factor Authentication) feature is released'
			) }
			description={ translate(
				'We strongly recommend setting up 2FA, it adds an additional layer of security to your Professional Email account.'
			) }
			callToAction={ translate( 'Set up 2FA' ) }
			icon="my-sites"
			horizontal
			href={ `#` }
			dismissPreferenceName="email_management_banner_setup_titan_2fa"
			event="calypso_email_management_banner_setup_titan_2fa"
			tracksClickName="calypso_email_management_banner_setup_titan_2fa_click"
			tracksDismissName="calypso_email_management_banner_setup_titan_2fa_dismiss"
			tracksImpressionName="calypso_email_management_banner_setup_titan_2fa_view"
		/>
	);
}
