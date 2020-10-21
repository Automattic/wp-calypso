/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';
import FormattedHeader from 'calypso/components/formatted-header';
import { preventWidows } from 'calypso/lib/formatting';
import JetpackComMasterbar from '../jpcom-masterbar';

/**
 * Style dependencies
 */
import './style.scss';

const Header = () => {
	const translate = useTranslate();
	const isAlternateSelector = isEnabled( 'plans/alternate-selector' );
	const header = isAlternateSelector
		? translate( 'Security, performance, and growth tools for WordPress' )
		: translate( 'Security, performance, and marketing tools for WordPress' );

	return (
		<>
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
