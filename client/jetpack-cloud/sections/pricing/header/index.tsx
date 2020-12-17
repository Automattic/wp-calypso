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

/**
 * Style dependencies
 */
import './style.scss';

const Header: React.FC = () => {
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
