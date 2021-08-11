import { useTranslate } from 'i18n-calypso';
import React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import { preventWidows } from 'calypso/lib/formatting';
import JetpackComMasterbar from '../jpcom-masterbar';
import './style.scss';

const Header: React.FC< Props > = () => {
	const translate = useTranslate();

	return (
		<>
			<JetpackComMasterbar />

			<div className="header">
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows(
						translate( 'Security, performance, and marketing tools made for WordPress' )
					) }
					align="center"
				/>
			</div>

			<IntroPricingBanner />
		</>
	);
};

type Props = {
	urlQueryArgs: { [ key: string ]: string };
};

export default Header;
