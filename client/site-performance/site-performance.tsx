import { translate } from 'i18n-calypso';
import { useState } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { PageSelector } from './components/PageSelector';
import { PerformanceReport } from './components/PerformanceReport';
import { DeviceTabControls, Tab } from './components/device-tab-control';

import './style.scss';

export const SitePerformance = () => {
	const [ activeTab, setActiveTab ] = useState< Tab >( 'mobile' );

	return (
		<div className="site-performance">
			<div className="site-performance-device-tab-controls__container">
				<NavigationHeader
					className="site-performance__navigation-header"
					title={ translate( 'Performance' ) }
					subtitle={ translate(
						'Optimize your site for lightning-fast performance. {{link}}Learn more.{{/link}}',
						{
							components: {
								link: <InlineSupportLink supportContext="site-monitoring" showIcon={ false } />,
							},
						}
					) }
				/>
				<PageSelector />
				<DeviceTabControls onDeviceTabChange={ setActiveTab } value={ activeTab } />
			</div>
			<PerformanceReport
				// TODO: Retrieve actual wpcom_performance_url values.
				wpcom_performance_url={ { url: '', hash: '' } }
				activeTab={ activeTab }
			/>
		</div>
	);
};
