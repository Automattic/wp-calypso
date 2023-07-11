import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { updateLogTypeQueryParam } from '../../site-logs-filter-params';
import type { SiteLogsTab } from 'calypso/data/hosting/use-site-logs-query';
import './style.scss';

export const tabs = [
	{ name: 'php', title: __( 'PHP Logs' ) },
	{ name: 'web', title: __( 'Webserver Logs' ) },
];

interface SiteLogsTabPanelProps {
	children: React.ComponentProps< typeof TabPanel >[ 'children' ];
	selectedTab?: SiteLogsTab;
	className?: string;
	onSelected?: ( tabName: SiteLogsTab ) => void;
}

export const SiteLogsTabPanel = ( {
	children: renderContents,
	selectedTab = 'php',
	className,
	onSelected,
}: SiteLogsTabPanelProps ) => {
	return (
		<TabPanel
			initialTabName={ selectedTab }
			className={ classnames( 'site-logs-tab-panel', className ) }
			tabs={ tabs }
			onSelect={ ( tabName ) => {
				updateLogTypeQueryParam( tabName as SiteLogsTab );
				onSelected?.( tabName as SiteLogsTab );
			} }
		>
			{ ( tab ) => renderContents( tab ) }
		</TabPanel>
	);
};
