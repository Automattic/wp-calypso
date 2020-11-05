/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'calypso/components/formatted-header';
import { preventWidows } from 'calypso/lib/formatting';
import { getJetpackCROActiveVersion } from 'calypso/my-sites/plans-v2/abtest';
import JetpackComMasterbar from '../jpcom-masterbar';
import OlarkChat from 'calypso/components/olark-chat';
import config from 'calypso/config';

/**
 * Style dependencies
 */
import './style.scss';

const Header = () => {
	const isAlternateSelector =
		getJetpackCROActiveVersion() === 'v1' || getJetpackCROActiveVersion() === 'v2';
	const header = isAlternateSelector
		? translate( 'Security, performance, and growth tools for WordPress' )
		: translate( 'Security, performance, and marketing tools for WordPress' );

	const identity = config( 'olark_chat_identity' );

	return (
		<>
			{ identity && <OlarkChat { ...{ identity } } /> }
			<JetpackComMasterbar />
			<div className="header">
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows( header ) }
					align="center"
				/>
				{ ! isAlternateSelector && (
					<p>
						{ translate(
							'Get everything your site needs, in one package — so you can focus on your business.'
						) }
					</p>
				) }
			</div>
		</>
	);
};

export default Header;
