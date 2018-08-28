/** @format */

/**
 * External dependencies
 */
import React from 'react';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import ColorSchemePicker from 'blocks/color-scheme-picker';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';

class WpcomColorScheme extends Component {
	updateColorScheme( colorScheme ) {
		apiFetch( {
			path: '/me/settings',
			method: 'POST',
			body: {
				calypso_preferences: {
					colorScheme,
				},
			},
		} );
	}

	render() {
		return (
			<FormFieldset>
				<FormLabel htmlFor="color_scheme">{ __( 'Admin Color Scheme' ) }</FormLabel>
				<ColorSchemePicker temporarySelection onSelection={ this.updateColorScheme } />
			</FormFieldset>
		);
	}
}

registerBlockType( 'a8c/wpcom-color-scheme', {
	title: 'WordPress.com Color Scheme',
	icon: 'art',
	category: 'layout',
	edit: WpcomColorScheme,
	save: WpcomColorScheme,
} );
