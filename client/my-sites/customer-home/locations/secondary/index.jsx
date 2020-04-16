/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import MasteringGutenberg from 'my-sites/customer-home/cards/education/mastering-gutenberg-compact';
import FreePhotoLibrary from 'my-sites/customer-home/cards/education/free-photo-library-compact';
import MultiCard from 'my-sites/customer-home/cards/education/multicard';
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import GrowEarn from 'my-sites/customer-home/cards/features/grow-earn';
import LaunchSite from 'my-sites/customer-home/cards/features/launch-site';
import Stats from 'my-sites/customer-home/cards/features/stats';
import Support from 'my-sites/customer-home/cards/features/support';
import LearnGrow from './learn-grow';

const cardComponents = {
	'home-action-launch-site': LaunchSite,
	'home-education-gutenberg': MasteringGutenberg,
	'home-education-free-photo-library': FreePhotoLibrary,
	'home-feature-go-mobile-desktop': GoMobile,
	'home-feature-grow-and-earn': GrowEarn,
	'home-feature-stats': Stats,
	'home-feature-support': Support,
	'home-section-learn-grow': LearnGrow,
};

const Secondary = ( { cards } ) => {
	if ( ! cards ) {
		return null;
	}
	const allPossibleEducationalCards = [
		'home-education-gutenberg',
		'home-education-free-photo-library',
	];
	const educationalCards = cards.filter( card => allPossibleEducationalCards.includes( card ) );
	const multiCards = [];

	return (
		<>
			{ cards.map( card => {
				if ( ! cardComponents[ card ] ) {
					return null;
				}
				if ( educationalCards.includes( card ) ) {
					multiCards.push(
						React.createElement( cardComponents[ card ], {
							key: card,
						} )
					);
					return null;
				}
				return React.createElement( cardComponents[ card ], {
					key: card,
				} );
			} ) }
			<MultiCard cards={ multiCards } />
		</>
	);
};

export default Secondary;
