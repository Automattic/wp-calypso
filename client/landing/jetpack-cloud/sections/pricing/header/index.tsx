/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';

/**
 * Style dependencies
 */
import './style.scss';

const Header = () => (
	<div className="header">
		<FormattedHeader
			headerText={ translate( 'Security, performance, and marketing tools for WordPress' ) }
			align="center"
		/>
		<FormattedHeader headerText={ translate( 'Plans' ) } align="center" />
		<p>
			{ translate(
				'Get everything your site needs, in one package — so you can focus on your business.'
			) }
		</p>
	</div>
);

export default Header;
