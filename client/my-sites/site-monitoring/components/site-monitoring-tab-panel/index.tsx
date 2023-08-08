import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { updatePageQueryParam } from '../../site-monitoring-filter-params';
import type { SiteMonitoringTab } from '../../site-monitoring-filter-params';
import './style.scss';

export const tabs = [
	{ name: 'metrics', title: __( 'Metrics' ) },
	{ name: 'php', title: __( 'PHP Logs' ) },
	{ name: 'web', title: __( 'Webserver Logs' ) },
];

interface SiteMonitoringTabPanelProps {
	children: React.ComponentProps< typeof TabPanel >[ 'children' ];
	selectedTab?: SiteMonitoringTab;
	className?: string;
	onSelected?: ( tabName: SiteMonitoringTab ) => void;
}

export const SiteMonitoringTabPanel = ( {
	children: renderContents,
	selectedTab = 'metrics',
	className,
	onSelected,
}: SiteMonitoringTabPanelProps ) => {
	return (
		<TabPanel
			initialTabName={ selectedTab }
			className={ classnames( 'site-monitoring-tab-panel', className ) }
			tabs={ tabs }
			onSelect={ ( tabName ) => {
				updatePageQueryParam( tabName as SiteMonitoringTab );
				onSelected?.( tabName as SiteMonitoringTab );
			} }
		>
			{ ( tab ) => renderContents( tab ) }
		</TabPanel>
	);
};
