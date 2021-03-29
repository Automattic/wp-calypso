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
import { useExperiment } from 'calypso/lib/explat';
import { preventWidows } from 'calypso/lib/formatting';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';

/**
 * Style dependencies
 */
import './style.scss';

const Header: React.FC< Props > = () => {
	const translate = useTranslate();
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'jetpack_explat_testing'
	);

	let headerText;
	if ( isLoadingExperimentAssignment ) {
		headerText = translate( 'Security, performance, and marketing tools made for WordPress' );
	} else if ( 'treatment' === experimentAssignment?.variationName ) {
		headerText = translate( 'Security, performance, and marketing tools made for WordPress' );
	} else {
		headerText = translate( 'Security, performance, and marketing tools made for WordPress' );
	}

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
