import { Metrics } from 'calypso/data/site-profiler/types';
import { MetricTabBar } from '.';
import './style_v2.scss';

type Props = Record< Metrics, number > & {
	activeTab: Metrics;
	setActiveTab: ( tab: Metrics ) => void;
};

export const MetricTabBarV2 = ( props: Props ) => {
	return <MetricTabBar { ...props } />;
};
