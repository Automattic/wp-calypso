import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import type { FC } from 'react';

const UpgradePlanLoader: FC = () => (
	<div className="import__upgrade-plan-loader">
		<LoadingEllipsis />
	</div>
);

export default UpgradePlanLoader;
