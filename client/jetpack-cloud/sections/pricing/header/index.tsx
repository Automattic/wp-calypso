import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import { preventWidows } from 'calypso/lib/formatting';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';

import './style.scss';

const Header: React.FC< Props > = () => {
	const translate = useTranslate();
	const jetpackSaleCoupon = useSelector( getJetpackSaleCoupon );
	const useV2Banner = config.isEnabled( 'jetpack/pricing-page-v2-banner' );

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

			{ useV2Banner || jetpackSaleCoupon !== null ? null : <IntroPricingBanner /> }
		</>
	);
};

type Props = {
	urlQueryArgs: { [ key: string ]: string };
};

export default Header;
