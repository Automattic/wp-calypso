/**
 * External dependencies
 */
import React from 'react';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';

export default class extends React.Component {
	static displayName = 'ContactFormViewPreviewFieldset';

	render() {
		return (
			<FormFieldset
				{ ...omit( this.props, 'className' ) }
				className="wpview-type-contact-form-field" // eslint-disable-line wpcalypso/jsx-classname-namespace
			>
				{ this.props.children }
			</FormFieldset>
		);
	}
}
