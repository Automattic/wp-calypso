import { useTranslate } from 'i18n-calypso';
import React, { useMemo } from 'react';
import DashboardNotice from 'calypso/dashboard/components/notice';
import useCreditBalanceQuery from 'calypso/data/promote-post/use-promote-post-credit-balance-query';
import { getCreditExpirationInfo, getCreditExpirationLines } from '../../utils';

function CreditsNotice() {
	const translate = useTranslate();
	const { data: { history: creditsHistory = [] } = {} } = useCreditBalanceQuery();
	const { hasExpiringCredits, sortedHistory } = useMemo(
		() => getCreditExpirationInfo( creditsHistory ),
		[ creditsHistory ]
	);

	const expirationLines = useMemo(
		() => getCreditExpirationLines( sortedHistory, translate ),
		[ sortedHistory, translate ]
	);

	if ( ! hasExpiringCredits || ! expirationLines ) {
		return null;
	}

	return (
		<DashboardNotice variant="warning">
			{ expirationLines.map( ( line, index ) => (
				<div key={ index }>{ line }</div>
			) ) }
		</DashboardNotice>
	);
}

export default CreditsNotice;
