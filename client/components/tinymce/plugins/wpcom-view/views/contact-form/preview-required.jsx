/**
 * External dependencies
 */

import React from 'react';

import { localize } from 'i18n-calypso';

class ContactFormViewPreviewRequired extends React.Component {
	static displayName = 'ContactFormViewPreviewRequired';

	render() {
		if ( this.props.required ) {
			return (
				<em>
					&nbsp;(
					{ this.props.translate( 'required' ) })
				</em>
			);
		}

		return null;
	}
}

export default localize( ContactFormViewPreviewRequired );
