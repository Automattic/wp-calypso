import { createElement } from 'react';
import {
	FEATURE_STATS,
	SECTION_LEARN_GROW,
	FEATURE_SUPPORT,
} from 'calypso/my-sites/customer-home/cards/constants';
import HelpSearch from 'calypso/my-sites/customer-home/cards/features/help-search';
import Stats from 'calypso/my-sites/customer-home/cards/features/stats';
import LearnGrow from './learn-grow';

const cardComponents = {
	[ FEATURE_STATS ]: Stats,
	[ SECTION_LEARN_GROW ]: LearnGrow,
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
