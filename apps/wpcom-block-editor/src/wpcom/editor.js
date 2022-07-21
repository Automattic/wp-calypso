import { registerPlugin } from '@wordpress/plugins';
import './features/deprecate-coblocks-buttons';
import './features/fix-block-invalidation-errors';
import './features/reorder-block-categories';
import './features/override-edit-site-back-button';
import './features/tracking';
import './features/use-classic-block-guide';
import InserterMenuTrackingEvent from './features/tracking/wpcom-inserter-menu-search-term';
import './editor.scss';

registerPlugin( 'track-inserter-menu-events', {
	render() {
		return <InserterMenuTrackingEvent />;
	},
} );
