import { createElement } from 'react';
import BloggingPrompt from 'calypso/components/blogging-prompt-card';
import {
	FEATURE_DOMAIN_UPSELL,
	FEATURE_STATS,
	SECTION_LEARN_GROW,
	FEATURE_SUPPORT,
	SECTION_BLOGGING_PROMPT,
	LAUNCHPAD_INTENT_BUILD,
	LAUNCHPAD_INTENT_WRITE,
	LAUNCHPAD_INTENT_FREE_NEWSLETTER,
	LAUNCHPAD_INTENT_PAID_NEWSLETTER,
	LAUNCHPAD_PRE_LAUNCH,
	NOTICE_READER_FIRST_POSTS,
} from 'calypso/my-sites/customer-home/cards/constants';
import DomainUpsell from 'calypso/my-sites/customer-home/cards/features/domain-upsell';
import HelpSearch from 'calypso/my-sites/customer-home/cards/features/help-search';
import Stats from 'calypso/my-sites/customer-home/cards/features/stats';
import LaunchpadIntentBuild from 'calypso/my-sites/customer-home/cards/launchpad/intent-build';
import {
	LaunchpadIntentFreeNewsletter,
	LaunchpadIntentPaidNewsletter,
} from 'calypso/my-sites/customer-home/cards/launchpad/intent-newsletter';
import LaunchpadIntentWrite from 'calypso/my-sites/customer-home/cards/launchpad/intent-write';
import LaunchpadPreLaunch from 'calypso/my-sites/customer-home/cards/launchpad/pre-launch';
import ReaderFirstPosts from 'calypso/my-sites/customer-home/cards/notices/reader-first-posts';
import LearnGrow from './learn-grow';

const cardComponents = {
	[ FEATURE_DOMAIN_UPSELL ]: DomainUpsell,
	[ FEATURE_STATS ]: Stats,
	[ SECTION_LEARN_GROW ]: LearnGrow,
	[ SECTION_BLOGGING_PROMPT ]: BloggingPrompt,
	[ FEATURE_SUPPORT ]: HelpSearch,
	[ NOTICE_READER_FIRST_POSTS ]: ReaderFirstPosts,
	[ LAUNCHPAD_INTENT_BUILD ]: LaunchpadIntentBuild,
	[ LAUNCHPAD_INTENT_WRITE ]: LaunchpadIntentWrite,
	[ LAUNCHPAD_INTENT_FREE_NEWSLETTER ]: LaunchpadIntentFreeNewsletter,
	[ LAUNCHPAD_INTENT_PAID_NEWSLETTER ]: LaunchpadIntentPaidNewsletter,
	[ LAUNCHPAD_PRE_LAUNCH ]: LaunchpadPreLaunch,
};

const Secondary = ( { cards, siteId } ) => {
	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			{ cards.map(
				( card, index ) =>
					cardComponents[ card ] &&
					createElement( cardComponents[ card ], {
						key: card + index,
						...( card === SECTION_BLOGGING_PROMPT
							? { siteId: siteId, showMenu: true, viewContext: 'home' }
							: {} ),
					} )
			) }
		</>
	);
};

export default Secondary;
