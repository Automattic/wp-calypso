import { registerPlugin } from '@wordpress/plugins';
import './features/theme-preview-back-link';
import './features/deprecate-coblocks-buttons';
import './features/fix-block-invalidation-errors';
import './features/fix-coblocks-fonts';
import './features/reorder-block-categories';
import './features/override-edit-site-back-button';
import './features/tracking';
import './features/use-classic-block-guide';
import { RedirectOnboardingUserAfterPublishingPost } from './features/redirect-onboarding-user-after-publishing-post';
import InserterMenuTrackingEvent from './features/tracking/wpcom-inserter-menu-search-term';
import './features/site-editor-env-consistency';
import './editor.scss';
import './features/tracking/site-editor-load';

registerPlugin( 'track-inserter-menu-events', {
	render() {
		return <InserterMenuTrackingEvent />;
	},
} );

registerPlugin( 'start-writing-flow', {
	render() {
		return <RedirectOnboardingUserAfterPublishingPost />;
	},
} );
