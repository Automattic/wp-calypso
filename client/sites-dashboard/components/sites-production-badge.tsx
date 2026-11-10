import styled from '@emotion/styled';
import SitesLaunchStatusBadge from 'calypso/sites-dashboard/components/sites-launch-status-badge';

const SitesProductionBadge = styled( SitesLaunchStatusBadge )`
	color: var( --studio-gray-80 );

	color: var( --studio-gray-90 );
	background-color: var( --studio-green-5 );
`;

export default SitesProductionBadge;
