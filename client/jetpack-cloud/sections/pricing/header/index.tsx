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
	const hasJetpackSaleCoupon = useSelector( getJetpackSaleCoupon );

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

			{ ! hasJetpackSaleCoupon && <IntroPricingBanner /> }
		</>
	);
};

type Props = {
	urlQueryArgs: { [ key: string ]: string };
};

export default Header;
