/**
 * External dependencies
 */
import React from 'react';
import { isDesktop } from '@automattic/viewport';
import userAgent from 'lib/user-agent';

/**
 * Internal dependencies
 */
import ConnectAccounts from 'my-sites/customer-home/cards/tasks/connect-accounts';
import Webinars from 'my-sites/customer-home/cards/tasks/webinars';
import FindDomain from 'my-sites/customer-home/cards/tasks/find-domain';
import SiteSetupList from 'my-sites/customer-home/cards/tasks/site-setup-list';
import GoMobile from 'my-sites/customer-home/cards/tasks/go-mobile';

const cardComponents = {
	'home-task-site-setup-checklist': SiteSetupList,
	'home-task-connect-accounts': ConnectAccounts,
	'home-task-find-domain': FindDomain,
	'home-task-webinars': Webinars,
	'home-task-go-mobile-android': GoMobile,
	'home-task-go-mobile-ios': GoMobile,
};

const Primary = ( { checklistMode, cards } ) => {
	if ( ! cards || ! cards.length ) {
		return null;
	}

	// Hard-coded. To be removed after D43129-code is merged
	if ( ! isDesktop() ) {
		const { isiPad, isiPod, isiPhone, isAndroid } = userAgent;
		const isIos = isiPad || isiPod || isiPhone;
		if ( isAndroid || isIos ) {
			const emulatedTask = isAndroid ? 'home-task-go-mobile-android' : 'home-task-go-mobile-ios';
			// Prevent duplicates once D43129-code is merged
			if ( -1 === cards.indexOf( emulatedTask ) ) {
				cards.push( emulatedTask );
			}
		}
	}
	return (
		<>
			{ cards.map( ( card, index ) =>
				React.createElement( cardComponents[ card ], {
					key: index,
					checklistMode: card === 'home-task-site-setup-checklist' ? checklistMode : null,
					isIos: card === 'home-task-go-mobile-ios' ? true : null,
				} )
			) }
		</>
	);
};

export default Primary;
