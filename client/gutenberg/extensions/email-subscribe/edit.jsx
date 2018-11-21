/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { ServerSideRender /*, PanelBody, InspectorControls*/ } from '@wordpress/components';
/**
 * Internal dependencies
 */

// import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
// const fields = [
// 	{ id: 'title', label: __( 'Title', 'jetpack' ) },
// 	{ id: 'email_placeholder', label: __( 'Placeholder', 'jetpack' ) },
// 	{ id: 'submit_label', label: __( 'Submit button label', 'jetpack' ) },
// 	{ id: 'consent_text', label: __( 'Consent text', 'jetpack' ) },
// 	{ id: 'processing_label', label: __( '"Processing" status message', 'jetpack' ) },
// 	{ id: 'success_label', label: __( 'Success status message', 'jetpack' ) },
// 	{ id: 'error_label', label: __( 'Error status message', 'jetpack' ) },
// ];

/*

When I add InspectorControls to render method, its failing  - and i dont know why

 Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.
 Check the render method of `EmailSubscribeEdit`.

<InspectorControls>
	{ fields.map( function( field ) {
		return <TextControl
			label = { field.label }
			key = { field.id }
			value = { props.attributes[ field.id ] }
			onChange = { value => {
				const newVal = {};
				newVal[ field.id ] = value;
				props.setAttributes( newVal );
			} }
		/>;
	} ) }
</InspectorControls>
*/

class EmailSubscribeEdit extends Component {
	render() {
		return (
			<Fragment>
				<ServerSideRender block="jetpack/email-subscribe" attributes={ this.props.attributes } />
			</Fragment>
		);
	}
}

export default EmailSubscribeEdit;
