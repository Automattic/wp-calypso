/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { dispatch } from '@wordpress/data';
import { initializeTracksWithIdentity, PatternDefinition } from '@automattic/page-pattern-modal';
import React from '@wordpress/element';

/**
 * Internal dependencies
 */
import { PagePatternsPlugin } from './page-patterns-plugin';
import './store';
import './index.scss';

declare global {
	interface Window {
		starterPageTemplatesConfig?: {
			templates?: PatternDefinition[];
			locale?: string;
			theme?: string;
			screenAction?: string;
			tracksUserData?: Parameters< typeof initializeTracksWithIdentity >[ 0 ];
		};
	}
}

// Load config passed from backend.
const { templates: patterns = [], tracksUserData, screenAction, theme, locale } =
	window.starterPageTemplatesConfig ?? {};

if ( tracksUserData ) {
	initializeTracksWithIdentity( tracksUserData );
}

// Open plugin only if we are creating new page.
if ( screenAction === 'add' ) {
	dispatch( 'automattic/starter-page-layouts' ).setOpenState( 'OPEN_FROM_ADD_PAGE' );
}

// Always register ability to open from document sidebar.
registerPlugin( 'page-patterns', {
	render: () => {
		return <PagePatternsPlugin patterns={ patterns } theme={ theme } locale={ locale } />;
	},

	// `registerPlugin()` types assume `icon` is mandatory however it isn't
	// actually required.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	icon: undefined as any,
} );
