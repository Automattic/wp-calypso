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
import { isExpiringSoon } from 'lib/domains/utils';
import { domainManagementNameServers } from 'my-sites/domains/paths';
import getCurrentRoute from 'state/selectors/get-current-route';

const DomainOnlyCta = ( { domain, selectedSiteSlug, translate } ) => {
	const currentRoute = useSelector( getCurrentRoute );
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
				<div className="domain-only-cta__button-row">
					<Button primary>{ translate( 'Connect to a WordPress.com site' ) }</Button>
					<Button borderless onClick={ handleChangeNameServersClick }>
						{ translate( 'Change name servers' ) }
					</Button>
				</div>
			</div>
		</>
	);
};

export default localize( DomainOnlyCta );
