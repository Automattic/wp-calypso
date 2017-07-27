/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import EmptyContent from 'components/empty-content';
import HeaderCake from 'components/header-cake';

export default function() {
	return (
		<Main>
			<HeaderCake backHref="/">Demo Page</HeaderCake>
			<EmptyContent title="Demo Page" line="Nothing to see here." />
		</Main>
	);
}
