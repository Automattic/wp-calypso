import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getQuerySearchForTab } from '../../site-monitoring-filter-params';
import type { SiteMonitoringTab } from '../../site-monitoring-filter-params';
import './style.scss';

export const tabs = [
	{ name: 'metrics', title: __( 'Metrics' ) },
	{ name: 'php', title: __( 'PHP Logs' ) },
	{ name: 'web', title: __( 'Web Server Logs' ) },
];

interface SiteMonitoringTabPanelProps {
	selectedTab?: SiteMonitoringTab;
	className?: string;
}

export const SiteMonitoringTabPanel = ( {
	selectedTab = 'metrics',
	className,
}: SiteMonitoringTabPanelProps ) => {
	const siteSlug = useSelector( getSelectedSiteSlug ) as string;
	const selectedText = tabs.find( ( t ) => t.name === selectedTab )?.title || selectedTab;
	return (
		<SectionNav
			selectedText={ selectedText }
			className={ clsx( 'site-monitoring-tab-panel', className ) }
		>
			<NavTabs>
				{ tabs.map( ( { name, title } ) => {
					return (
						<NavItem
							key={ name }
							path={
								name === 'metrics'
									? `/site-monitoring/${ siteSlug }${ getQuerySearchForTab( name ) }`
									: `/site-monitoring/${ siteSlug }/${ name }${ getQuerySearchForTab( name ) }`
							}
							selected={ selectedTab === name }
						>
							{ title }
						</NavItem>
					);
				} ) }
			</NavTabs>
		</SectionNav>
	);
};
