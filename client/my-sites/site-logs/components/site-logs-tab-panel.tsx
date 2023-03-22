import styled from '@emotion/styled';
import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import page from 'page';

export const tabs = [
	{ name: 'php', title: __( 'PHP Logs' ) },
	{ name: 'web', title: __( 'Webserver Logs' ) },
];

interface SiteLogsTabPanelProps {
	children( tab: TabPanel.Tab ): JSX.Element;
	className?: string;
	onSelected?: ( tab: string ) => void;
	initialTab?: TabPanel.Tab;
}

const LogsTabPanel = styled( TabPanel )`
	.components-tab-panel__tabs {
		overflow-x: auto;
	}
	.components-tab-panel__tabs-item {
		--wp-admin-theme-color: var( --studio-gray-100 );
		color: var( --studio-gray-60 );
		padding: 0;
		margin-right: 24px;
		font-size: 16px;
		flex-shrink: 0;
	}
	.components-tab-panel__tabs-item:hover,
	.components-tab-panel__tabs-item.is-active,
	.components-tab-panel__tabs-item.is-active:focus,
	.components-tab-panel__tabs-item:focus:not( :disabled ) {
		box-shadow: inset 0 -2px 0 0 var( --wp-admin-theme-color );
		color: var( --studio-gray-100 );
	}
`;

export const SiteLogsTabPanel = ( {
	children: renderContents,
	className,
	onSelected,
	initialTab = tabs[ 0 ],
}: SiteLogsTabPanelProps ) => {
	return (
		<LogsTabPanel
			className={ className }
			tabs={ tabs }
			initialTabName={ initialTab.name }
			onSelect={ ( tabName ) => {
				onTabSelected( tabName );
				onSelected?.( tabName );
			} }
		>
			{ ( tab ) => renderContents( tab ) }
		</LogsTabPanel>
	);
};

function onTabSelected( tabName: string ) {
	const url = new URL( window.location.href );
	url.searchParams.set( 'logType', tabName );
	page.replace( url.pathname + url.search );
}
