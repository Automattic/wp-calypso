import { createElement } from 'react';
import BloggingPrompt from 'calypso/components/blogging-prompt-card';
import {
	FEATURE_DOMAIN_UPSELL,
	FEATURE_STATS,
	SECTION_LEARN_GROW,
	FEATURE_SUPPORT,
	SECTION_BLOGGING_PROMPT,
	LAUNCHPAD_KEEP_BUILDING,
	LAUNCHPAD_INTENT_WRITE,
} from 'calypso/my-sites/customer-home/cards/constants';
import DomainUpsell from 'calypso/my-sites/customer-home/cards/features/domain-upsell';
import HelpSearch from 'calypso/my-sites/customer-home/cards/features/help-search';
import Stats from 'calypso/my-sites/customer-home/cards/features/stats';
import LaunchpadBlogFlow from 'calypso/my-sites/customer-home/cards/launchpad/blog-flow';
import LaunchpadKeepBuilding from 'calypso/my-sites/customer-home/cards/launchpad/keep-building';
import LearnGrow from './learn-grow';

const cardComponents = {
	[ FEATURE_DOMAIN_UPSELL ]: DomainUpsell,
	[ FEATURE_STATS ]: Stats,
	[ SECTION_LEARN_GROW ]: LearnGrow,
	[ SECTION_BLOGGING_PROMPT ]: BloggingPrompt,
	[ FEATURE_SUPPORT ]: HelpSearch,
	[ LAUNCHPAD_KEEP_BUILDING ]: LaunchpadKeepBuilding,
	[ LAUNCHPAD_INTENT_WRITE ]: LaunchpadBlogFlow,
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
