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
import JetpackComMasterbar from '../jpcom-masterbar';

/**
 * Style dependencies
 */
import './style.scss';

const Header = () => (
	<>
		<JetpackComMasterbar />
		<div className="header">
			<FormattedHeader
				className="header__main-title"
				headerText={ preventWidows(
					translate( 'Security, performance, and growth tools for WordPress' )
				) }
				align="center"
			/>
		</div>
	</>
);

export default Header;
