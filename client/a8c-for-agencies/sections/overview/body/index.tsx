import OverviewBodyEvents from './events';
import OverviewBodyHosting from './hosting';
import OverviewBodyNextSteps from './next-steps';
import OverviewBodyProducts from './products';

const OverviewBody = () => {
	return (
		<div className="overview-body">
			<OverviewBodyNextSteps />
			<OverviewBodyEvents />
			<OverviewBodyHosting />
			<OverviewBodyProducts />
		</div>
	);
};

export default OverviewBody;
