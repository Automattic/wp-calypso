import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import IntroPricingBannerV2 from 'calypso/components/jetpack/intro-pricing-banner-v2';
import { preventWidows } from 'calypso/lib/formatting';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';

import './style.scss';

const Header: React.FC< Props > = () => {
	const translate = useTranslate();
	const jetpackSaleCoupon = useSelector( getJetpackSaleCoupon );
	const useV2Banner = config.isEnabled( 'jetpack/pricing-page-v2-banner' );

	const renderBanner = () => {
		if ( useV2Banner ) {
			return <IntroPricingBannerV2 jetpackSaleCoupon={ jetpackSaleCoupon } />;
		}
		return jetpackSaleCoupon !== null ? null : <IntroPricingBanner />;
	};

	return (
		<>
			<div className="header">
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows(
						translate( 'Security, performance, and marketing tools made for WordPress' )
					) }
					align="center"
				/>
			</div>

			{ renderBanner() }
		</>
	);
};

type Props = {
	urlQueryArgs: { [ key: string ]: string };
};

export default Header;
