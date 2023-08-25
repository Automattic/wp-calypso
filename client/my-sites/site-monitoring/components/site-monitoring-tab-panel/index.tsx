import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { SiteMonitoringTab } from '../../site-monitoring-filter-params';
import './style.scss';

export const tabs = [
	{ name: 'metrics', title: __( 'Metrics' ) },
	{ name: 'php', title: __( 'PHP Logs' ) },
	{ name: 'web', title: __( 'Webserver Logs' ) },
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
	return (
		<SectionNav
			selectedText={ selectedTab }
			className={ classnames( 'site-monitoring-tab-panel', className ) }
		>
			<NavTabs>
				{ tabs.map( ( { name, title } ) => {
					return (
						<NavItem
							key={ name }
							path={
								name === 'metrics'
									? `/site-monitoring/${ siteSlug }`
									: `/site-monitoring/${ siteSlug }/${ name }`
							}
							selected={ selectedTab === name }
							children={ title }
						/>
					);
				} ) }
			</NavTabs>
		</SectionNav>
	);
};
