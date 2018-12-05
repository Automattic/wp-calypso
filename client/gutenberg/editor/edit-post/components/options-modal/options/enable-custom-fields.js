/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BaseOption from './base';

export class EnableCustomFieldsOption extends Component {
	constructor( { isChecked } ) {
		super( ...arguments );

		this.toggleCustomFields = this.toggleCustomFields.bind( this );

		this.state = { isChecked };
	}

	toggleCustomFields() {
		// Submit a hidden form which triggers the toggle_custom_fields admin action.
		// This action will toggle the setting and reload the editor with the meta box
		// assets included on the page.
		document.getElementById( 'toggle-custom-fields-form' ).submit();

		// Make it look like something happened while the page reloads.
		this.setState( { isChecked: ! this.props.isChecked } );
	}

	render() {
		const { label } = this.props;
		const { isChecked } = this.state;

		return (
			<BaseOption label={ label } isChecked={ isChecked } onChange={ this.toggleCustomFields } />
		);
	}
}

export default withSelect( select => ( {
	isChecked: !! select( 'core/editor' ).getEditorSettings().enableCustomFields,
} ) )( EnableCustomFieldsOption );
