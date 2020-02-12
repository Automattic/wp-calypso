/**
 * External dependencies
 */
import React from 'react';

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
	return (
		<Masterbar>
			<Item
				className="masterbar__item-home"
				url="/"
				tooltip="Jetpack Cloud Homepage" /* @todo: localize the string */
			>
				<JetpackLogo size={ 28 } full monochrome />
			</Item>
		</Masterbar>
	);
}
