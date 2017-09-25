/**
 * External dependencies
 */
import { omit } from 'lodash';
import React from 'react';

export default React.createClass( {
	displayName: 'ContactFormViewPreviewFieldset',

	render() {
		return (
			<fieldset { ...omit( this.props, 'className' ) } className="wpview-type-contact-form-field">
				{ this.props.children }
			</fieldset>
		);
	}
} );
