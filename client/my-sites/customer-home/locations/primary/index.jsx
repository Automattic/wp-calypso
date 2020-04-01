/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import ChecklistSiteSetup from 'my-sites/customer-home/cards/primary/checklist-site-setup';
import QuickLinks from 'my-sites/customer-home/cards/primary/quick-links';

const cardComponents = {
	'home-feature-go-mobile-phones': GoMobile,
	'home-primary-checklist-site-setup': ChecklistSiteSetup,
	'home-primary-quick-links': QuickLinks,
};

const Primary = ( { checklistMode, cards } ) => {
	return (
		<div className="primary">
			{ cards &&
				cards.map( ( card, index ) =>
					React.createElement( cardComponents[ card ], {
						key: index,
						checklistMode: card === 'home-primary-checklist-site-setup' ? checklistMode : null,
					} )
				) }
		</div>
	);
};

export default Primary;
