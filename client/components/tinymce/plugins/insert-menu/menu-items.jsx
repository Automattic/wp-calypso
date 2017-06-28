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
const GridiconButton = ( { icon, label } ) => (
	<div>
		<Gridicon className="wpcom-insert-menu__menu-icon" icon={ icon } />
		<span className="wpcom-insert-menu__menu-label">{ label }</span>
	</div>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

const menuItems = [	{
	name: 'insert_media_item',
	item: <GridiconButton icon="add-image" label={ i18n.translate( 'Add Media' ) } />,
	cmd: 'wpcomAddMedia'
} ];

if ( config.isEnabled( 'external-media' ) ) {
	menuItems.push( {
		name: 'insert_from_google',
		item: <GridiconButton icon="add-image" label={ i18n.translate( 'Add from Google' ) } />,
		cmd: 'googleAddMedia'
	} );
}

menuItems.push( {
	name: 'insert_contact_form',
	item: <GridiconButton icon="mention" label={ i18n.translate( 'Add Contact Form' ) } />,
	cmd: 'wpcomContactForm'
} );

export default menuItems;
