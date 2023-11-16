import { createElement } from 'react';
import { FEATURE_STATS, SECTION_MANAGE_SITE } from 'calypso/my-sites/customer-home/cards/constants';
import Stats from 'calypso/my-sites/customer-home/cards/features/stats';
import ManageSite from './manage-site';

const cardComponents = {
	[ SECTION_MANAGE_SITE ]: ManageSite,
	[ FEATURE_STATS ]: Stats,
};

const Tertiary = ( { cards } ) => {
	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			{ cards.map(
				( card, index ) =>
					cardComponents[ card ] &&
					createElement( cardComponents[ card ], {
						key: index,
					} )
			) }
		</>
	);
};

export default Tertiary;
