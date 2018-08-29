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
import getColorSchemesData from 'blocks/color-scheme-picker/constants';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadiosBar from 'components/forms/form-radios-bar';
import 'blocks/color-scheme-picker/style.scss';

class WpcomColorScheme extends Component {
	state = {
		colorSchemePreference: null,
	};

	componentDidMount() {
		apiFetch( {
			path: '/me/settings?http_envelope=1',
		} ).then( response => {
			this.setState( {
				colorSchemePreference: response.calypso_preferences.colorScheme,
			} );
		} );
	}

	updateColorScheme = event => {
		this.setState( {
			colorSchemePreference: event.target.value,
		} );

		const data = {
			calypso_preferences: {
				colorScheme: event.target.value,
			},
		};
		// This currently requires different treatment for Calypso and wp-admin
		const requestBody =
			typeof window.wp !== 'undefined'
				? {
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify( data ),
				  }
				: {
						body: data,
				  };

		apiFetch( {
			path: '/me/settings?http_envelope=1',
			method: 'POST',
			...requestBody,
		} );
	};

	render() {
		if ( ! this.state.colorSchemePreference ) {
			return null;
		}

		return (
			<FormFieldset>
				<FormLabel htmlFor="color_scheme">{ __( 'Admin Color Scheme' ) }</FormLabel>
				<div className="wpcom-color-scheme__main color-scheme-picker">
					<FormRadiosBar
						isThumbnail
						checked={ this.state.colorSchemePreference }
						onChange={ this.updateColorScheme }
						items={ getColorSchemesData( __ ) }
					/>
				</div>
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
