/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import ChecklistSiteSetup from 'my-sites/customer-home/cards/primary/checklist-site-setup';
import MasteringGutenberg from 'my-sites/customer-home/cards/education/mastering-gutenberg';
import QuickLinks from 'my-sites/customer-home/cards/primary/quick-links';

const cardComponents = {
	'home-feature-go-mobile-phones': GoMobile,
	'home-primary-checklist-site-setup': ChecklistSiteSetup,
	'home-primary-quick-links': QuickLinks,
	'home-education-mastering-gutenberg': MasteringGutenberg,
};

const Primary = ( { checklistMode, cards } ) => {
	// Always ensure we have primary content.
	if ( cards && cards.length < 1 ) {
		cards = [ 'home-primary-quick-links' ];
	}
	return (
		<div className="primary">
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
