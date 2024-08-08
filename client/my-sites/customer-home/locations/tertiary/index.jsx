import { createElement } from 'react';
import TranslatorInvite from 'calypso/components/translator-invite';
import { SECTION_MANAGE_SITE } from 'calypso/my-sites/customer-home/cards/constants';
import ManageSite from './manage-site';

const cardComponents = {
	[ SECTION_MANAGE_SITE ]: ManageSite,
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
			<TranslatorInvite path="/home" />
		</>
	);
};

export default Tertiary;
