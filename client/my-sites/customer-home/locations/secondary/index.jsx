/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import MasteringGutenberg from 'my-sites/customer-home/cards/education/mastering-gutenberg-compact';
import FreePhotoLibrary from 'my-sites/customer-home/cards/education/free-photo-library-compact';
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import GrowEarn from 'my-sites/customer-home/cards/features/grow-earn';
import LaunchSite from 'my-sites/customer-home/cards/features/launch-site';
import Stats from 'my-sites/customer-home/cards/features/stats';
import Support from 'my-sites/customer-home/cards/features/support';
import LearnGrow from './learn-grow';
import DotPager from 'components/dot-pager';

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
	let skipEducationalCard = false;

	return (
		<>
			{ cards.map( card => {
				if ( ! cardComponents[ card ] ) {
					return null;
				}
				if ( educationalCards.includes( card ) ) {
					if ( skipEducationalCard ) {
						return null;
					}

					skipEducationalCard = true;
					return (
						<DotPager key={ card }>
							{ educationalCards.map( educationalCard =>
								React.createElement( cardComponents[ educationalCard ], {
									key: educationalCard,
								} )
							) }
						</DotPager>
					);
				}
				return React.createElement( cardComponents[ card ], {
					key: card,
				} );
			} ) }
		</>
	);
};

export default Secondary;
