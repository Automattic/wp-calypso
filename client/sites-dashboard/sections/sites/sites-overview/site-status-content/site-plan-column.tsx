import { SiteExcerptData } from '@automattic/sites';
import * as React from 'react';
import { SitePlan } from 'calypso/sites-dashboard/components/sites-site-plan';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

type Props = {
	site: SiteExcerptData;
};

export default function SitePlanColumn( { site }: Props ) {
	const userId = useSelector( getCurrentUserId );
	return (
		<span className="sites-overview__row-plan">
			<SitePlan site={ site } userId={ userId } />
		</span>
	);
}
