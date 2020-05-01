/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import ChecklistSiteSetup from 'my-sites/customer-home/cards/tasks/checklist-site-setup';
import MasteringGutenberg from 'my-sites/customer-home/cards/education/mastering-gutenberg';
import QuickLinks from 'my-sites/customer-home/cards/actions/quick-links';
import WpForTeamsQuickLinks from 'my-sites/customer-home/cards/actions/wp-for-teams-quick-links';
import ConnectAccounts from 'my-sites/customer-home/cards/tasks/connect-accounts';
import Webinars from 'my-sites/customer-home/cards/tasks/webinars';
import FindDomain from 'my-sites/customer-home/cards/tasks/find-domain';
import SiteSetupList from 'my-sites/customer-home/cards/tasks/site-setup-list';
import config from 'config';

const cardComponents = {
	'home-feature-go-mobile-phones': GoMobile,
	'home-primary-checklist-site-setup': ChecklistSiteSetup,
	'home-primary-quick-links': QuickLinks,
	'home-education-mastering-gutenberg': MasteringGutenberg,
	'home-action-wp-for-teams-quick-links': WpForTeamsQuickLinks,
	'home-task-site-setup-checklist': SiteSetupList,
	'home-task-connect-accounts': ConnectAccounts,
	'home-task-find-domain': FindDomain,
	'home-task-webinars': Webinars,
};

const Primary = ( { checklistMode, cards } ) => {
	if ( ! config.isEnabled( 'home/experimental-layout' ) ) {
		// Always ensure we have primary content.
		if ( cards && cards.length < 1 ) {
			cards = [ 'home-primary-quick-links' ];
		}
	}
	return (
		<>
			{ cards &&
				cards.map(
					( card, index ) =>
						cardComponents[ card ] &&
						React.createElement( cardComponents[ card ], {
							key: index,
							checklistMode: [
								'home-primary-checklist-site-setup',
								'home-task-site-setup-checklist',
							].includes( card )
								? checklistMode
								: null,
						} )
				) }
		</>
	);
};

export default Primary;
