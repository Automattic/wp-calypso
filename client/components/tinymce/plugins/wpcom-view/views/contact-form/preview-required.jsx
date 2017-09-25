/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

export default localize( React.createClass( {
	displayName: 'ContactFormViewPreviewRequired',

	render() {
		if ( this.props.required ) {
			return <em>&nbsp;({ this.props.translate( 'required' ) })</em>;
		}

		return null;
	}
} ) );
