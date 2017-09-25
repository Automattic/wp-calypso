/**
 * External dependencies
 */
import React from 'react';

import { localize } from 'i18n-calypso';

export default localize( React.createClass( {
	displayName: 'BackToLibrary',

	render() {
		return (
		    <span className="editor-media-modal__back-to-library">
				<span className="is-mobile">{ this.props.translate( 'Library' ) }</span>
				<span className="is-desktop">{ this.props.translate( 'Media Library' ) }</span>
			</span>
		);
	}
} ) );
