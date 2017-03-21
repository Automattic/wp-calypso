/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

function DomainSuggestionFlag( { content } ) {
	return (
		<Notice
			isCompact
			status="is-success">
			{ content }
		</Notice>
	);
}

export default DomainSuggestionFlag;
