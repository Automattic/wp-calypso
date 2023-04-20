import { registerPlugin } from '@wordpress/plugins';
import './features/deprecate-coblocks-buttons';
import './features/fix-block-invalidation-errors';
import './features/fix-coblocks-fonts';
import './features/reorder-block-categories';
import './features/override-edit-site-back-button';
import './features/tracking';
import './features/use-classic-block-guide';
import InserterMenuTrackingEvent from './features/tracking/wpcom-inserter-menu-search-term';
import './features/site-editor-env-consistency';
import './editor.scss';
import './features/redirect-onboarding-user-after-publishing-post';

registerPlugin( 'track-inserter-menu-events', {
	render() {
		return <InserterMenuTrackingEvent />;
	},
} );
