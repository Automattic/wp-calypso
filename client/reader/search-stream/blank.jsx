/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */

// TODO post-refresh: delete this file
export function BlankContent() {
	const imgPath = '/calypso/images/drake/drake-404.svg';

	return (
		<div className="search-stream__blank">
			<img src={ imgPath } width="500" className="empty-content__illustration" />
		</div>
	);
}

export default BlankContent;
