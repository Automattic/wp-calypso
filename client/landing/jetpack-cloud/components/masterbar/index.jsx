/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Item from 'layout/masterbar/item';
import JetpackLogo from 'components/jetpack-logo';
import Masterbar from 'layout/masterbar/masterbar';

/**
 * Style dependencies
 */
import './style.scss';

export default function() {
	const translate = useTranslate();

	return (
		<Masterbar>
			<Item
				className="masterbar__item-home"
				url="/"
				tooltip={ translate( 'Jetpack Cloud Homepage', {
					comment: 'Jetpack Cloud masterbar nav item',
				} ) }
			>
				<JetpackLogo size={ 28 } full monochrome />
			</Item>
		</Masterbar>
	);
}
