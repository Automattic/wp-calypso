/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';
import GridiconImage from 'gridicons/dist/image';
import GridiconShutter from 'gridicons/dist/shutter';
import GridiconMoney from 'gridicons/dist/money';
import GridiconImageMultiple from 'gridicons/dist/image-multiple';
import GridiconMention from 'gridicons/dist/mention';

/**
 * Internal dependencies
 */
import config from 'config';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const GridiconButton = ( { icon, label, e2e } ) => (
	<div className="wpcom-insert-menu__menu">
		{ React.cloneElement( icon, { className: 'wpcom-insert-menu__menu-icon' } ) }
		<span className="wpcom-insert-menu__menu-label" data-e2e-insert-type={ e2e }>
			{ label }
		</span>
	</div>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

export const menuItems = [
	{
		name: 'insert_media_item',
		item: (
			<GridiconButton icon={ <GridiconImage /> } label={ i18n.translate( 'Media' ) } e2e="media" />
		),
		cmd: 'wpcomAddMedia',
	},
];

if ( config.isEnabled( 'external-media' ) ) {
	if ( config.isEnabled( 'external-media/google-photos' ) ) {
		menuItems.push( {
			name: 'insert_from_google',
			item: (
				<GridiconButton
					icon={ <GridiconShutter /> }
					label={ i18n.translate( 'Media from Google' ) }
					e2e="google-media"
				/>
			),
			cmd: 'googleAddMedia',
		} );
	}
	if ( config.isEnabled( 'external-media/free-photo-library' ) ) {
		menuItems.push( {
			name: 'insert_from_pexels',
			item: (
				<GridiconButton
					icon={ <GridiconImageMultiple /> }
					label={ i18n.translate( 'Free photo library' ) }
					e2e="stock-media-pexels"
				/>
			),
			cmd: 'pexelsAddMedia',
		} );
	}
}

menuItems.push( {
	name: 'insert_contact_form',
	item: (
		<GridiconButton
			icon={ <GridiconMention /> }
			label={ i18n.translate( 'Contact form' ) }
			e2e="contact-form"
		/>
	),
	cmd: 'wpcomContactForm',
} );

menuItems.push( {
	name: 'insert_payment_button',
	item: (
		<GridiconButton
			icon={ <GridiconMoney /> }
			label={ i18n.translate( 'Payment button' ) }
			e2e="payment-button"
		/>
	),
	cmd: 'simplePaymentsButton',
} );

if ( config.isEnabled( 'memberships' ) ) {
	menuItems.push( {
		name: 'insert_memberships_button',
		item: (
			<GridiconButton
				icon={ <GridiconMoney /> }
				label={ i18n.translate( 'Recurring Payment' ) }
				e2e="memberships"
			/>
		),
		cmd: 'membershipsButton',
	} );
}
