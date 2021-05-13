/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

class SiteBlockListItemPlaceholder extends PureComponent {
	render() {
		return (
			<div className="site-blocks__list-item is-placeholder">
				<span className="site-blocks__list-item-placeholder-text">Blocked site</span>
			</div>
		);
	}
}

export default SiteBlockListItemPlaceholder;
