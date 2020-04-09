/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ChecklistSiteSetup from 'my-sites/customer-home/cards/primary/checklist-site-setup';
import MasteringGutenberg from 'my-sites/customer-home/cards/education/mastering-gutenberg';
import GrowEarn from 'my-sites/customer-home/cards/features/grow-earn';
import Stats from 'my-sites/customer-home/cards/features/stats';
import FreePhotoLibrary from 'my-sites/customer-home/cards/education/free-photo-library';

const cardComponents = {
	'home-feature-stats': Stats,
	'home-feature-grow-and-earn': GrowEarn,
	'home-primary-checklist-site-setup': ChecklistSiteSetup,
	'home-education-mastering-gutenberg': MasteringGutenberg,
	'home-education-free-photo-library': FreePhotoLibrary,
};

const Primary = ( { checklistMode, cards } ) => {
	const translate = useTranslate();

	if ( ! cards ) {
		return null;
	}

	// Always ensure we have primary content.
	if ( cards.length < 1 ) {
		cards = [ 'home-feature-stats' ];
	}

	const stats = cards.shift();

	return (
		<div className="primary">
			<h2>{ translate( 'Stats at a glance' ) }</h2>
			{ React.createElement( cardComponents[ stats ], {
				checklistMode: stats === 'home-primary-checklist-site-setup' ? checklistMode : null,
			} ) }
			<h2>{ translate( 'Learn and grow' ) }</h2>
			{ cards &&
				cards.map(
					( card, index ) =>
						cardComponents[ card ] &&
						React.createElement( cardComponents[ card ], {
							key: index,
							checklistMode: card === 'home-primary-checklist-site-setup' ? checklistMode : null,
						} )
				) }
		</div>
	);
};

export default Primary;
