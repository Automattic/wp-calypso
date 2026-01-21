import React, { useMemo } from 'react';
import DashboardNotice from 'calypso/dashboard/components/notice';
import useCreditBalanceQuery from 'calypso/data/promote-post/use-promote-post-credit-balance-query';
import { useCreditExpirationLines } from '../../hooks/use-credit-expiration-lines';
import { getCreditExpirationInfo } from '../../utils';

import './style.scss';

function CreditsNotice() {
	const { data: { history: creditsHistory = [] } = {} } = useCreditBalanceQuery();
	const { hasExpiringCredits, sortedHistory } = useMemo(
		() => getCreditExpirationInfo( creditsHistory ),
		[ creditsHistory ]
	);

	const expirationLines = useCreditExpirationLines( sortedHistory, false );

	if ( ! hasExpiringCredits || ! expirationLines ) {
		return null;
	}

	return (
		<DashboardNotice variant="warning">
			<div className="promote-post-i2__credits-notice-content">
				<div className="promote-post-i2__credits-notice-header">{ expirationLines[ 0 ] }</div>
				<ul>
					{ expirationLines.slice( 1 ).map( ( line, index ) => (
						<li key={ index }>{ line }</li>
					) ) }
				</ul>
			</div>
		</DashboardNotice>
	);
}

export default CreditsNotice;
