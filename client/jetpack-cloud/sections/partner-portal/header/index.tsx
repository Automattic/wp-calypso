/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackComMasterbar from 'calypso/jetpack-cloud/sections/pricing/jpcom-masterbar';
import FormattedHeader from 'calypso/components/formatted-header';
import OlarkChat from 'calypso/components/olark-chat';
import config from '@automattic/calypso-config';
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Style dependencies
 */
import './style.scss';

export default function Header() {
	const identity = config( 'olark_chat_identity' );
	const translate = useTranslate();
	const title = translate( 'Security, performance, and growth tools for WordPress' );

	return (
		<>
			{ identity && <OlarkChat { ...{ identity } } /> }
			<JetpackComMasterbar />
			<div className={ classNames( 'header' ) }>
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows( title ) }
					align="center"
				/>
			</div>
		</>
	);
}
