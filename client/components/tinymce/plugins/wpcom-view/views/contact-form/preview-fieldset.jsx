/**
 * External dependencies
 */

import React from 'react';
import { omit } from 'lodash';

export default class extends React.Component {
	static displayName = 'ContactFormViewPreviewFieldset';

	render() {
		return (
			<fieldset { ...omit( this.props, 'className' ) } className="wpview-type-contact-form-field">
				{ this.props.children }
			</fieldset>
		);
	}
}
