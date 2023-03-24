import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import page from 'page';
import './style.scss';

export const tabs = [
	{ name: 'php', title: __( 'PHP Logs' ) },
	{ name: 'web', title: __( 'Webserver Logs' ) },
];

export type SiteLogsTab = 'php' | 'web';

interface SiteLogsTabPanelProps {
	children( tab: TabPanel.Tab ): JSX.Element;
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
				onTabSelected( tabName );
				onSelected?.( tabName as SiteLogsTab );
			} }
		>
			{ ( tab ) => renderContents( tab ) }
		</TabPanel>
	);
};

function onTabSelected( tabName: string ) {
	const url = new URL( window.location.href );
	url.searchParams.set( 'log-type', tabName );
	page.replace( url.pathname + url.search );
}
