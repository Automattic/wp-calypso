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
import OlarkChat from 'calypso/components/olark-chat';
import config from 'calypso/config';
import { preventWidows } from 'calypso/lib/formatting';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getJetpackCROActiveVersion } from 'calypso/my-sites/plans/jetpack-plans/abtest';
import { Iterations } from 'calypso/my-sites/plans/jetpack-plans/iterations';

// New Year 2021 promotion; runs from Jan 1 00:00 to Jan 18 23:59 UTC automatically.
// Safe to remove on or after Jan 19.
import NewYear2021SaleBanner from './new-year-2021-sale-banner';

/**
 * Style dependencies
 */
import './style.scss';

const Header: React.FC< Props > = ( { urlQueryArgs } ) => {
	const identity = config( 'olark_chat_identity' );
	const translate = useTranslate();
	const iteration = useMemo( getJetpackCROActiveVersion, [] ) as Iterations;

	const moment = useLocalizedMoment();
	const showPromo = useMemo( () => {
		const paramValue = urlQueryArgs?.[ 'newpack' ];

		// If we're not forcing visibility via a query param,
		// fall back to checking against the current browser time
		if ( paramValue === undefined ) {
			// Start at midnight UTC on Jan 1,
			// and continue until 23:59:59 UTC on Jan 18
			const promoStart = moment.utc( '2021-01-01' );
			const promoEnd = moment.utc( '2021-01-19' );

			return moment().isBetween( promoStart, promoEnd, 'second', '[)' );
		}

		// Show the promo if the `newpack` arg is present,
		// as long as the arg value isn't '0' or 'false'.
		return ! [ '0', 'false' ].some(
			( v ) => v.localeCompare( paramValue, 'en', { sensitivity: 'base' } ) === 0
		);
	}, [ urlQueryArgs, moment ] );

	const title =
		{
			[ Iterations.V1 ]: translate( 'Security, performance, and growth tools for WordPress' ),
			[ Iterations.V2 ]: translate( 'Security, performance, and growth tools for WordPress' ),
			[ Iterations.I5 ]: translate(
				'Security, performance, and marketing tools made for WordPress'
			),
		}[ iteration ] ?? translate( 'Security, performance, and marketing tools for WordPress' );
	const tagline =
		{
			[ Iterations.V1 ]: '',
			[ Iterations.V2 ]: '',
			[ Iterations.I5 ]: '',
		}[ iteration ] ??
		translate(
			'Get everything your site needs, in one package — so you can focus on your business.'
		);

	return (
		<>
			{ identity && <OlarkChat { ...{ identity } } /> }
			<JetpackComMasterbar />

			{ showPromo && <NewYear2021SaleBanner /> }

			<div className={ classNames( 'header', iteration ) }>
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows( title ) }
					align="center"
				/>
				{ tagline && <p>{ tagline }</p> }
			</div>
		</>
	);
};

type Props = {
	urlQueryArgs: { [ key: string ]: string };
};

export default Header;
