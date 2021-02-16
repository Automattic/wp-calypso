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
import { getForCurrentCROIteration } from 'calypso/my-sites/plans/jetpack-plans/iterations';
import { Iterations } from 'calypso/my-sites/plans/jetpack-plans/iterations';

// Fresh Start 2021 promotion; runs from Feb 1 00:00 to Feb 14 23:59 UTC automatically.
// Safe to remove on or after Feb 15.
import FreshStart2021SaleBanner from 'calypso/components/jetpack/fresh-start-2021-sale-banner';

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

	return (
		<>
			<JetpackComMasterbar />

			<FreshStart2021SaleBanner urlQueryArgs={ urlQueryArgs } />

			<div className={ classNames( 'header', iterationClassName ) }>
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows( title ) }
					align="center"
				/>
			</div>
		</>
	);
};

type Props = {
	urlQueryArgs: { [ key: string ]: string };
};

export default Header;
