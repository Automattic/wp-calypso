/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import ChecklistSiteSetup from 'my-sites/customer-home/cards/primary/checklist-site-setup';

const cardComponents = {
	'home-feature-go-mobile-phones': GoMobile,
	'home-primary-checklist-site-setup': ChecklistSiteSetup,
};

const UpNext = ( { checklistMode, cards } ) => {
	return (
		<div className="up-next">
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

export default UpNext;
