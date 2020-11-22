/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useMemo } from 'react';
import moment from 'moment';

/**
 * Internal dependencies
 */
import JetpackComMasterbar from '../jpcom-masterbar';
import FormattedHeader from 'calypso/components/formatted-header';
import OlarkChat from 'calypso/components/olark-chat';
import config from 'calypso/config';
import { preventWidows } from 'calypso/lib/formatting';
import { getJetpackCROActiveVersion } from 'calypso/my-sites/plans-v2/abtest';
import { Iterations } from 'calypso/my-sites/plans-v2/iterations';
// Black Friday 2020 promotion; runs Nov 20-30 automatically. Safe to remove after Dec 1
import BlackFriday2020Banner from './black-friday-2020-banner';

/**
 * Style dependencies
 */
import './style.scss';

type HeaderProps = {
	urlQueryArgs: { [ key: string ]: string };
};

const Header: React.FC< HeaderProps > = ( { urlQueryArgs } ) => {
	const identity = config( 'olark_chat_identity' );
	const translate = useTranslate();
	const iteration = useMemo( getJetpackCROActiveVersion, [] ) as Iterations;

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

	// Black Friday 2020 promotion; runs Nov 20-30 automatically. Safe to remove after Dec 1
	// The banner should go live at November 20, 00:00:00 UTC and then go dark on November 30, 23:59:59 UTC
	const promoStartDateUTC = moment.utc( '2020-11-20', 'YYYY-MM-DD HH:mm:ss' );
	const promoEndDateUTC = moment.utc( '2020-11-30 23:59:59', 'YYYY-MM-DD HH:mm:ss' );
	const today = moment();
	const todayUTC = moment.utc( today );

	// Use query param `?bf=true` to preview the banner outside of Black Friday: https://cloud.jetpack.com/pricing?bf=true
	const hasPromoQueryParam = urlQueryArgs?.bf === 'true';
	const isWithinPromoDate =
		todayUTC.isBetween( promoStartDateUTC, promoEndDateUTC ) || hasPromoQueryParam;

	return (
		<>
			{ identity && <OlarkChat { ...{ identity } } /> }
			<JetpackComMasterbar />

			{ isWithinPromoDate && <BlackFriday2020Banner /> }

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

export default Header;
