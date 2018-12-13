/** @format */

/**
 * External dependencies
 */
import { ServerSideRender, TextControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';
import { Fragment, Component } from '@wordpress/element';
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
					{ this.fields.map( field => (
						<TextControl
							label={ field.label }
							key={ field.id }
							value={ attributes[ field.id ] }
							onChange={ field.set }
						/>
					) ) }
				</InspectorControls>
				<ServerSideRender block="jetpack/email-subscribe" attributes={ attributes } />
			</Fragment>
		);
	}
}

export default EmailSubscribeEdit;
