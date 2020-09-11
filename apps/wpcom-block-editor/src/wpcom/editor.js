/* eslint-disable import/no-extraneous-dependencies */

/**
 * WordPress dependencies
 */

import { registerPlugin } from '@wordpress/plugins';

/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import './features/deprecate-coblocks-buttons';
import './features/fix-block-invalidation-errors';
import './features/reorder-block-categories';
import './features/tracking';
import './features/convert-to-blocks-button';
import './features/use-classic-block-guide';

/**
 * Style dependencies
 */
import './editor.scss';

import InserterMenuTrackingEvent from './features/tracking/wpcom-inserter-menu-search-term';

registerPlugin( 'track-inserter-menu-events', {
	render() {
		return <InserterMenuTrackingEvent />;
	},
} );
