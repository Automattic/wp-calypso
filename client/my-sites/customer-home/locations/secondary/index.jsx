import { createElement } from 'react';
import {
	FEATURE_DOMAIN_UPSELL,
	FEATURE_STATS,
	SECTION_LEARN_GROW,
	FEATURE_SUPPORT,
	SECTION_BLOGGING_PROMPT,
} from 'calypso/my-sites/customer-home/cards/constants';
import BloggingPrompt from 'calypso/my-sites/customer-home/cards/features/blogging-prompt';
import DomainUpsell from 'calypso/my-sites/customer-home/cards/features/domain-upsell';
import HelpSearch from 'calypso/my-sites/customer-home/cards/features/help-search';
import Stats from 'calypso/my-sites/customer-home/cards/features/stats';
import LearnGrow from './learn-grow';

const cardComponents = {
	[ FEATURE_DOMAIN_UPSELL ]: DomainUpsell,
	[ FEATURE_STATS ]: Stats,
	[ SECTION_LEARN_GROW ]: LearnGrow,
	[ SECTION_BLOGGING_PROMPT ]: BloggingPrompt,
	[ FEATURE_SUPPORT ]: HelpSearch,
};

const Secondary = ( { cards } ) => {
	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			{ cards.map(
				( card ) =>
					cardComponents[ card ] &&
					createElement( cardComponents[ card ], {
						key: card,
					} )
			) }
		</>
	);
};

export default Secondary;
