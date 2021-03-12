/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackComMasterbar from '../jpcom-masterbar';
import FormattedHeader from 'calypso/components/formatted-header';
import { preventWidows } from 'calypso/lib/formatting';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import useMaybeSocialProofHeader from 'calypso/my-sites/plans/jetpack-plans/use-maybe-social-proof-header';

/**
 * Style dependencies
 */
import './style.scss';

const Header: React.FC< Props > = () => {
	const translate = useTranslate();

	const headerText =
		useMaybeSocialProofHeader() ??
		translate( 'Security, performance, and marketing tools made for WordPress' );

	return (
		<>
			<JetpackComMasterbar />

			<div className="header">
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows( headerText ) }
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
