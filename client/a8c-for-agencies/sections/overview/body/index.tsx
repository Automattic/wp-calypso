import { isEnabled } from '@automattic/calypso-config';
import OverviewBodyHosting from './hosting';
import OverviewBodyIntroCards from './intro-cards';
import OverviewBodyNextSteps from './next-steps';
import OverviewBodyProducts from './products';

const OverviewBody = () => {
	return (
		<div className="overview-body">
			{ ! isEnabled( 'a4a-unified-onboarding-tour' ) && <OverviewBodyIntroCards /> }
			<OverviewBodyNextSteps />
			<OverviewBodyHosting />
			<OverviewBodyProducts />
		</div>
	);
};

export default OverviewBody;
