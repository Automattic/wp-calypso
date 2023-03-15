import { createElement } from 'react';
import BloggingPrompt from 'calypso/components/blogging-prompt-card';
import {
	FEATURE_STATS,
	SECTION_LEARN_GROW,
	FEATURE_SUPPORT,
	SECTION_BLOGGING_PROMPT,
} from 'calypso/my-sites/customer-home/cards/constants';
import HelpSearch from 'calypso/my-sites/customer-home/cards/features/help-search';
import Stats from 'calypso/my-sites/customer-home/cards/features/stats';
import LearnGrow from './learn-grow';

const cardComponents = {
	[ FEATURE_STATS ]: Stats,
	[ SECTION_LEARN_GROW ]: LearnGrow,
	[ SECTION_BLOGGING_PROMPT ]: BloggingPrompt,
	[ FEATURE_SUPPORT ]: HelpSearch,
};

const Secondary = ( { cards, siteId } ) => {
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
						...( card === SECTION_BLOGGING_PROMPT
							? { siteId: siteId, showMenu: true, viewContext: 'home' }
							: {} ),
					} )
			) }
		</>
	);
};

export default Secondary;
