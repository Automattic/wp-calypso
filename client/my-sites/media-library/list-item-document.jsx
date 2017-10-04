/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ListItemFileDetails from './list-item-file-details';

module.exports = React.createClass( {
	displayName: 'MediaLibraryListItemDocument',

	render: function() {
		return <ListItemFileDetails { ...this.props } />;
	}
} );
