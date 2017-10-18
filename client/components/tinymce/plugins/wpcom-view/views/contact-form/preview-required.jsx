/**
 * External dependencies
 *
 * @format
 */

import React from 'react';

import { localize } from 'i18n-calypso';

const ContactFormViewPreviewRequired = React.createClass( {
	displayName: 'ContactFormViewPreviewRequired',

	render() {
		if ( this.props.required ) {
			return <em>&nbsp;({ this.props.translate( 'required' ) })</em>;
		}

		return null;
	},
} );

export default localize(ContactFormViewPreviewRequired);
