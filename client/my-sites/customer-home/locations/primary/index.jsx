/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ChecklistSiteSetup from 'my-sites/customer-home/cards/tasks/checklist-site-setup';

const cardComponents = {
	'home-task-site-setup-checklist': ChecklistSiteSetup,
};

const Primary = ( { checklistMode, cards } ) => {
	return (
		<div>
			{ cards &&
				cards.map(
					( card, index ) =>
						cardComponents[ card ] &&
						React.createElement( cardComponents[ card ], {
							key: index,
							checklistMode: card === 'home-task-site-checklist-site' ? checklistMode : null,
						} )
				) }
		</div>
	);
};

export default Primary;
