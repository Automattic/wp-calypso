/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useMemo } from 'react';

/**
 * Internal dependencies
 */
import JetpackComMasterbar from '../jpcom-masterbar';
import FormattedHeader from 'calypso/components/formatted-header';
import { preventWidows } from 'calypso/lib/formatting';
import {
	getForCurrentCROIteration,
	Iterations,
} from 'calypso/my-sites/plans/jetpack-plans/iterations';

// Fresh Start 2021 promotion; runs from Feb 16 00:00 to Mar 3 23:59 UTC automatically.
// Safe to remove on or after Mar 4.
import FreshStart2021SaleBanner from 'calypso/components/jetpack/fresh-start-2021-sale-banner';

// Part of the NPIP test iteration
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';

/**
 * Style dependencies
 */
import './style.scss';

const Header: React.FC< Props > = ( { urlQueryArgs } ) => {
	const translate = useTranslate();

	const iterationClassName = useMemo(
		() => getForCurrentCROIteration( ( variation: Iterations ) => `iteration-${ variation }` ),
		[]
	) as Iterations;
	const title = useMemo(
		() =>
			getForCurrentCROIteration( {
				[ Iterations.SPP ]: translate( 'Security, performance, and marketing tools for WordPress' ),
			} ) || translate( 'Security, performance, and marketing tools made for WordPress' ),
		[ translate ]
	);

	// Don't show for the NPIP variant
	const showFreshStartBanner = useMemo(
		() => getForCurrentCROIteration( ( variation: Iterations ) => variation !== Iterations.NPIP ),
		[]
	);

	// *Only* show for the NPIP variant
	const showIntroPricingBanner = useMemo(
		() => getForCurrentCROIteration( ( variation: Iterations ) => variation === Iterations.NPIP ),
		[]
	);

	return (
		<>
			<JetpackComMasterbar />

			{ showFreshStartBanner && <FreshStart2021SaleBanner urlQueryArgs={ urlQueryArgs } /> }

			<div className={ classNames( 'header', iterationClassName ) }>
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows( title ) }
					align="center"
				/>
			</div>

			{ showIntroPricingBanner && <IntroPricingBanner /> }
		</>
	);
};

type Props = {
	urlQueryArgs: { [ key: string ]: string };
};

export default Header;
