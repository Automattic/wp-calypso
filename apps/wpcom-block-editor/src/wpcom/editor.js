import { registerPlugin } from '@wordpress/plugins';
import './features/live-preview';
import './features/deprecate-coblocks-buttons';
import './features/fix-block-invalidation-errors';
import './features/fix-coblocks-fonts';
import './features/reorder-block-categories';
import './features/tracking';
import './features/use-classic-block-guide';
import { OnboardingNextStepAfterPublishingPost } from './features/onboarding-next-step-after-publishing-post';
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

registerPlugin( 'onboarding-next-step-after-publishing-post', {
	render() {
		return <OnboardingNextStepAfterPublishingPost />;
	},
} );
