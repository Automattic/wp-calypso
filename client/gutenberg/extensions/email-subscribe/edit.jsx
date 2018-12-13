/** @format */

/**
 * External dependencies
 */
import { Fragment } from '@wordpress/element';
import { ServerSideRender, TextControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';
/**
 * Internal dependencies
 */

import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const fields = [
	{ id: 'title', label: __( 'Title', 'jetpack' ) },
	{ id: 'email_placeholder', label: __( 'Placeholder', 'jetpack' ) },
	{ id: 'submit_label', label: __( 'Submit button label', 'jetpack' ) },
	{ id: 'consent_text', label: __( 'Consent text', 'jetpack' ) },
	{ id: 'processing_label', label: __( '"Processing" status message', 'jetpack' ) },
	{ id: 'success_label', label: __( 'Success status message', 'jetpack' ) },
	{ id: 'error_label', label: __( 'Error status message', 'jetpack' ) },
];

const EmailSubscribeEdit = props => (
	<Fragment>
		<InspectorControls>
			{ fields.map( function( field ) {
				return (
					<TextControl
						label={ field.label }
						key={ field.id }
						value={ props.attributes[ field.id ] }
						onChange={ value => {
							const newVal = {};
							newVal[ field.id ] = value;
							props.setAttributes( { [ field.id ]: value } );
						} }
					/>
				);
			} ) }
		</InspectorControls>
		<ServerSideRender block="jetpack/email-subscribe" attributes={ props.attributes } />
	</Fragment>
);

export default EmailSubscribeEdit;
