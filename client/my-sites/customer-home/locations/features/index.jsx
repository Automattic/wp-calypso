/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FreePhotoLibrary from 'my-sites/customer-home/cards/education/free-photo-library';
import MasteringGutenberg from 'my-sites/customer-home/cards/education/mastering-gutenberg';

const cardComponents = {
	'home-education-free-photo-library': FreePhotoLibrary,
	'home-education-mastering-gutenberg': MasteringGutenberg,
};

const Features = ( { cards } ) => {
	const translate = useTranslate();

	return (
		<>
			<h2>{ translate( 'Learn and grow' ) }</h2>
			{ cards &&
				cards.map(
					( card, index ) =>
						cardComponents[ card ] &&
						React.createElement( cardComponents[ card ], {
							key: index,
						} )
				) }
		</>
	);
};

export default Features;
