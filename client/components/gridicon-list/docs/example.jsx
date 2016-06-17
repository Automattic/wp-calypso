/* eslint-disable no-alert */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import GridiconList from 'components/gridicon-list';
import GridiconListItem from 'components/gridicon-list/item';

export default React.createClass( {
	displayName: 'GridiconList',

	render: function() {
		return (
			<div className="design-assets__group">
				<h2><a href="/devdocs/design/gridicon-list">Gridicon List</a></h2>
				<GridiconList>
					<GridiconListItem icon="checkmark">Get started right away</GridiconListItem>
					<GridiconListItem icon="speaker">Make your voice heard</GridiconListItem>
					<GridiconListItem icon="stats">Track stats</GridiconListItem>
					<GridiconListItem icon="heart">Contains no harmful substances</GridiconListItem>
					<GridiconListItem icon="globe">Made on Planet Earth</GridiconListItem>
				</GridiconList>
				<GridiconList>
					<GridiconListItem icon="checkmark">Item 1</GridiconListItem>
					<GridiconListItem icon="checkmark">Item 2 contains a<br/>new line</GridiconListItem>
					<GridiconListItem>Item 3</GridiconListItem>
					<GridiconListItem>Item 4 also contains<br/>a new line</GridiconListItem>
					<GridiconListItem icon="checkmark">Item 5</GridiconListItem>
				</GridiconList>
			</div>
		);
	}
} );
