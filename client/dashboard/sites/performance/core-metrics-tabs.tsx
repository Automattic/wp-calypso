import { __experimentalVStack as VStack, privateApis } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { Text } from '../../components/text';
import {
	metricsNames,
	mapThresholdsToStatus,
	getAvailableMetrics,
} from '../../utils/site-performance';
import { MetricScore } from './core-metrics-score';
import type { SitePerformanceReport } from '@automattic/api-core';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Tabs } = unlock( privateApis );

const Tab = ( { children, tabId }: { children: React.ReactNode; tabId: string } ) => {
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<Tabs.Tab tabId={ tabId } style={ { height: '100%' } }>
			<VStack alignment={ isDesktop ? 'flex-start' : 'center' } spacing={ 0 }>
				{ children }
			</VStack>
		</Tabs.Tab>
	);
};

const CoreMetricsTabs = ( {
	report,
	compact,
}: {
	report: SitePerformanceReport;
	compact?: boolean;
} ) => {
	const isSmall = useViewportMatch( 'small' );

	const availableMetrics = getAvailableMetrics( report );

	if ( availableMetrics.length === 0 ) {
		return null;
	}

	return (
		<Tabs.TabList style={ { maxWidth: '100%' } }>
			{ availableMetrics.map( ( metricKey ) => {
				const { name: displayName, shortName: shortDisplayName } = metricsNames[ metricKey ];
				const status = mapThresholdsToStatus( metricKey, report[ metricKey ] );

				return (
					<Tab key={ metricKey } tabId={ metricKey }>
						<Text size={ 11 } lineHeight="24px" upperCase variant="muted">
							{ compact ? shortDisplayName : displayName }
						</Text>
						<MetricScore
							lineHeight="32px"
							metric={ metricKey }
							status={ status }
							size={ isSmall ? 20 : 16 }
							value={ report[ metricKey ] }
						/>
					</Tab>
				);
			} ) }
		</Tabs.TabList>
	);
};

export default CoreMetricsTabs;
