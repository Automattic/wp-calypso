import { FC, ReactNode, FocusEvent } from 'react';
import UpsellNudgeNotice from './upsell-nudge';

import './style.scss';

interface ScheduledUpdatesGateProps {
	hasScheduledUpdate: boolean;
	isAtomic: boolean;
	children: ReactNode;
}

const ScheduledUpdatesGate: FC< ScheduledUpdatesGateProps > = ( {
	hasScheduledUpdate,
	isAtomic,
	children,
} ) => {
	const isEligibleForFeature = ! hasScheduledUpdate && isAtomic;

	const handleFocus = ( e: FocusEvent< HTMLDivElement > ) => {
		e.target.blur();
	};

	const getNoticeBanner = () => {
		if ( hasScheduledUpdate ) {
			return <UpsellNudgeNotice />;
		}
		return null;
	};

	if ( ! isEligibleForFeature ) {
		return (
			<div tabIndex={ -1 } className="scheduled-updates-gate" onFocus={ handleFocus }>
				{ getNoticeBanner() }
				<div className="scheduled-updates-gate__content">{ children }</div>
			</div>
		);
	}
	return <div>{ children }</div>;
};

export default ScheduledUpdatesGate;
