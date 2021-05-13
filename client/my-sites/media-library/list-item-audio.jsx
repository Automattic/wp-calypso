/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ListItemFileDetails from './list-item-file-details';

export default class extends React.Component {
	static displayName = 'MediaLibraryListItemDocument';

	render() {
		return <ListItemFileDetails { ...this.props } icon="audio" />;
	}
}
