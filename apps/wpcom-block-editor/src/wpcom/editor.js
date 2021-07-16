/**
 * WordPress dependencies
 */

import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import './features/deprecate-coblocks-buttons';
import './features/fix-block-invalidation-errors';
import './features/reorder-block-categories';
import './features/tracking';
import './features/use-classic-block-guide';
import './features/fix-featured-image-preview-size';

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
