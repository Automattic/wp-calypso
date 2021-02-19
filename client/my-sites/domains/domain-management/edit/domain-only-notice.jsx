/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { isExpiringSoon } from 'calypso/lib/domains/utils';
import {
	domainManagementNameServers,
	domainManagementTransferToOtherSite,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

const DomainOnlyNotice = ( { domain, selectedSiteSlug, translate } ) => {
	const currentRoute = useSelector( getCurrentRoute );
	const handleConnectToWPSiteClick = useCallback(
		() =>
			page( domainManagementTransferToOtherSite( selectedSiteSlug, domain.name, currentRoute ) ),
		[ domain.name, selectedSiteSlug, currentRoute ]
	);
	const handleChangeNameServersClick = useCallback(
		() => page( domainManagementNameServers( selectedSiteSlug, domain.name, currentRoute ) ),
		[ domain.name, selectedSiteSlug, currentRoute ]
	);

	if (
		domain.pendingTransfer ||
		domain.expired ||
		isExpiringSoon( domain, 30 ) ||
		! domain.currentUserCanManage
	) {
		return null;
	}

	return (
		<>
			<div>
				<p>
					{ translate(
						'Your domain is registered but not pointing to any services. You can connect it to a WordPress.com site or change your name servers to point it somewhere else.'
					) }
				</p>
				<div className="domain-only-notice__button-row">
					<Button primary onClick={ handleConnectToWPSiteClick }>
						{ translate( 'Connect to a WordPress.com site' ) }
					</Button>
					<Button borderless onClick={ handleChangeNameServersClick }>
						{ translate( 'Change name servers' ) }
					</Button>
				</div>
			</div>
		</>
	);
};

export default localize( DomainOnlyNotice );
