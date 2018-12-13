/** @format */

/**
 * External dependencies
 */
import { Fragment, Component } from '@wordpress/element';
import { ServerSideRender, TextControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';
/**
 * Internal dependencies
 */

import { fields } from '.';

class EmailSubscribeEdit extends Component {
	constructor( ...args ) {
		super( ...args );
		this.fields = fields.map( field => {
			field.set = value => this.props.setAttributes( { [ field.id ]: value } );
			return field;
		} );
	}

	render() {
		const { attributes } = this.props;
		return (
			<Fragment>
				<InspectorControls>
					{ this.fields.map( function( field ) {
						return (
							<TextControl
								label={ field.label }
								key={ field.id }
								value={ attributes[ field.id ] }
								onChange={ field.set }
							/>
						);
					} ) }
				</InspectorControls>
				<ServerSideRender block="jetpack/email-subscribe" attributes={ attributes } />
			</Fragment>
		);
	}
}

export default EmailSubscribeEdit;
