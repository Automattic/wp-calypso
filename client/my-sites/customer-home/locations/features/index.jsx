/**
 * External dependencies
 */
import React from 'react';

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
	return (
		<>
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
