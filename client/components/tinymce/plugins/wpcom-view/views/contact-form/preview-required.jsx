/**
 * External dependencies
 */
import React from 'react';

export default React.createClass( {
	displayName: 'ContactFormViewPreviewRequired',

	render() {
		if ( this.props.required ) {
			return ( <em>&nbsp;({ this.translate( 'required' ) })</em> );
		}

		return null;
	}
} );
