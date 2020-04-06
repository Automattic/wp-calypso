/**
 * External dependencies
 */

import React from 'react';

import { localize } from 'i18n-calypso';

class BackToLibrary extends React.Component {
	static displayName = 'BackToLibrary';

	render() {
		return (
			<span className="editor-media-modal__back-to-library">
				<span className="is-mobile">{ this.props.translate( 'Library' ) }</span>
				<span className="is-desktop">{ this.props.translate( 'Media Library' ) }</span>
			</span>
		);
	}
}

export default localize( BackToLibrary );
