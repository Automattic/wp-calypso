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
import { getJetpackCROActiveVersion } from 'calypso/my-sites/plans/jetpack-plans/abtest';
import { Iterations } from 'calypso/my-sites/plans/jetpack-plans/iterations';

// New Year 2021 promotion; runs from Jan 1 00:00 to Jan 18 23:59 UTC automatically.
// Safe to remove on or after Jan 19.
import NewYear2021SaleBanner from 'calypso/components/jetpack/new-year-2021-sale-banner';

/**
 * Style dependencies
 */
import './style.scss';

const Header: React.FC< Props > = ( { urlQueryArgs } ) => {
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

	return (
		<>
			{ identity && <OlarkChat { ...{ identity } } /> }
			<JetpackComMasterbar />

			<NewYear2021SaleBanner urlQueryArgs={ urlQueryArgs } />

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
