/**
 * External dependencies
 */
import React from 'react';
import omit from 'lodash/omit';

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
