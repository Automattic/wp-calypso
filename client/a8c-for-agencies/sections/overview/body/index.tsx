import OverviewBodyHosting from './hosting';
import OverviewBodyNextSteps from './next-steps';
import OverviewBodyProducts from './products';
import OverviewBodyTips from './tips';

const OverviewBody = () => {
	return (
		<div className="overview-body">
			<OverviewBodyTips />
			<OverviewBodyNextSteps />
			<OverviewBodyProducts />
			<OverviewBodyHosting />
		</div>
	);
};

export default OverviewBody;
