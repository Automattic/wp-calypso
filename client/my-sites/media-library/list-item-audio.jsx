/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ListItemFileDetails from './list-item-file-details';

export default React.createClass( {
	displayName: 'MediaLibraryListItemDocument',

	render: function() {
		return <ListItemFileDetails { ...this.props } icon="audio" />;
	}
} );
