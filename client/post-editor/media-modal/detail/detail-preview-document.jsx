/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

export default React.createClass( {
	displayName: 'EditorMediaModalDetailPreviewDocument',

	render() {
		return (
			<div className="editor-media-modal-detail__preview is-document">
				<Gridicon icon="pages" size={ 120 } />
			</div>
		);
	}
} );
