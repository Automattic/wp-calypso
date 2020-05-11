/**
 * External dependencies
 */
import React from 'react';
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import ConnectAccounts from 'my-sites/customer-home/cards/tasks/connect-accounts';
import Webinars from 'my-sites/customer-home/cards/tasks/webinars';
import FindDomain from 'my-sites/customer-home/cards/tasks/find-domain';
import SiteSetupList from 'my-sites/customer-home/cards/tasks/site-setup-list';
import { PerformanceTrackerStop } from 'lib/performance-tracking';
import GoMobile from 'my-sites/customer-home/cards/tasks/go-mobile';

const cardComponents = {
	'home-task-site-setup-checklist': SiteSetupList,
	'home-task-connect-accounts': ConnectAccounts,
	'home-task-find-domain': FindDomain,
	'home-task-webinars': Webinars,
	'home-task-go-mobile': GoMobile,
};

const Primary = ( { checklistMode, cards } ) => {
	if ( ! cards || ! cards.length ) {
		return null;
	}

	// Hard-coded. To be removed after D43129-code is merged
	if ( ! isDesktop() ) {
		// Prevent duplicates once D43129-code is merged
		if ( -1 === cards.indexOf( 'home-task-go-mobile' ) ) {
			cards.push( 'home-task-go-mobile' );
		}
	}
	return (
		<>
			{ cards.map( ( card, index ) =>
				React.createElement( cardComponents[ card ], {
					key: index,
					checklistMode: card === 'home-task-site-setup-checklist' ? checklistMode : null,
				} )
			) }
			<PerformanceTrackerStop />
		</>
	);
};

export default Primary;
