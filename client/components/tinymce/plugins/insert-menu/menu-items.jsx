/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import Gridicon from 'components/gridicon';
import { getSelectedSiteId } from 'state/ui/selectors';
import canCurrentUser from 'state/selectors/can-current-user';

const canUserUploadFiles = ( editor ) => {
	const store = editor.getParam( 'redux_store' );
	const state = store ? store.getState() : null;
	const siteId = state ? getSelectedSiteId( state ) : null;
	return state && siteId ? canCurrentUser( state, siteId, 'upload_files' ) : false;
};

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
			<GridiconButton
				icon={ <Gridicon icon="image" /> }
				label={ i18n.translate( 'Media' ) }
				e2e="media"
			/>
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
					icon={ <Gridicon icon="shutter" /> }
					label={ i18n.translate( 'Google Photos library' ) }
					e2e="google-media"
				/>
			),
			cmd: 'googleAddMedia',
			condition: canUserUploadFiles,
		} );
	}
	if ( config.isEnabled( 'external-media/free-photo-library' ) ) {
		menuItems.push( {
			name: 'insert_from_pexels',
			item: (
				<GridiconButton
					icon={ <Gridicon icon="image-multiple" /> }
					label={ i18n.translate( 'Free photo library' ) }
					e2e="stock-media-pexels"
				/>
			),
			cmd: 'pexelsAddMedia',
			condition: canUserUploadFiles,
		} );
	}
}

menuItems.push( {
	name: 'insert_contact_form',
	item: (
		<GridiconButton
			icon={ <Gridicon icon="mention" /> }
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
			icon={ <Gridicon icon="money" /> }
			label={ i18n.translate( 'Payment button' ) }
			e2e="payment-button"
		/>
	),
	cmd: 'simplePaymentsButton',
} );
