import React, { FC } from 'react';

interface SubscribersOverviewProps {
	siteId: number;
}

const SubscribersOverview: FC< SubscribersOverviewProps > = ( { siteId } ) => {
	// Render the component
	return <div>Subscribers Overview for { siteId }</div>;
};

export default SubscribersOverview;
