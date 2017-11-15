/** @format */

/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'gridicons';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const GridiconButton = ( { icon, label, e2e } ) => (
	<div className="wpcom-insert-menu__menu">
		<Gridicon className="wpcom-insert-menu__menu-icon" icon={ icon } />
		<span className="wpcom-insert-menu__menu-label" data-e2e-insert-type={ e2e }>
			{ label }
		</span>
	</div>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

export const menuItems = [
	{
		name: 'insert_media_item',
		item: <GridiconButton icon="add-image" label={ i18n.translate( 'Media' ) } e2e="media" />,
		cmd: 'wpcomAddMedia',
	},
];

if ( config.isEnabled( 'external-media' ) ) {
	menuItems.push( {
		name: 'insert_from_google',
		item: (
			<GridiconButton
				icon="add-image"
				label={ i18n.translate( 'Media from Google' ) }
				e2e="google-media"
			/>
		),
		cmd: 'googleAddMedia',
	} );
}

menuItems.push( {
	name: 'insert_contact_form',
	item: (
		<GridiconButton icon="mention" label={ i18n.translate( 'Contact Form' ) } e2e="contact-form" />
	),
	cmd: 'wpcomContactForm',
} );

if ( config.isEnabled( 'simple-payments' ) ) {
	menuItems.push( {
		name: 'insert_payment_button',
		item: (
			<GridiconButton
				icon="money"
				label={ i18n.translate( 'Payment Button' ) }
				e2e="payment-button"
			/>
		),
		cmd: 'simplePaymentsButton',
	} );
}
