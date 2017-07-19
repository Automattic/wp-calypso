/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';

const Settings = ( {
	children,
	translate
} ) => {
	const mainClassName = 'zoninator__main';

	return (
		<Main className={ mainClassName }>
			<DocumentHead title={ translate( 'WP Zone Manager' ) } />
			{ children }
		</Main>
	);
};

export default localize( Settings );
