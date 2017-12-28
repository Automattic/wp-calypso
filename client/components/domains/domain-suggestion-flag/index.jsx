/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Notice from 'client/components/notice';

function DomainSuggestionFlag( { content, status = 'info' } ) {
	return (
		<Notice isCompact status={ `is-${ status }` }>
			{ content }
		</Notice>
	);
}

export default DomainSuggestionFlag;
