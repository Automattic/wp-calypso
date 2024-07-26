import clsx from 'clsx';
import React, { FC } from 'react';
import PlanBandwidthBar, {
	PlanBandwidthBarProps,
} from 'calypso/hosting-overview/components/plan-bandwidth-bar';

type PlanBandwidthProps = {
	children?: React.ReactNode;
	className?: string;
	siteId: number;
	BandwidthBarComponent: FC< PlanBandwidthBarProps >;
};

export function PlanBandwidth( props: PlanBandwidthProps ) {
	const { children, className, siteId, BandwidthBarComponent = PlanBandwidthBar } = props;
	return (
		<div className={ clsx( className, 'plan-bandwidth' ) }>
			<BandwidthBarComponent siteId={ siteId } />
			{ children }
		</div>
	);
}
