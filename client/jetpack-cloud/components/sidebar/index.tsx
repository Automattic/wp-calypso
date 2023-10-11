import classNames from 'classnames';
import SiteSelector from 'calypso/components/site-selector';
import Header from './header';
import './style.scss';

// This is meant to be the "base" sidebar component. All context-specific sidebars
// (Sites Management, Plugin Management, Purchases, non-Manage functionality)
// would use it to construct the right experience for that context.

type Props = {
	className?: string;
	isJetpackManage?: boolean;
	navItems?: React.ReactNode[];
	footer?: React.ReactNode;
};
const Sidebar = ( { className, isJetpackManage = false, navItems = [], footer }: Props ) => (
	<nav className={ classNames( 'jetpack-cloud-sidebar', className ) }>
		<Header forceAllSitesView={ isJetpackManage } />
		<div className="jetpack-cloud-sidebar__main">
			<ul className="jetpack-cloud-sidebar__navigation-list">
				{ navItems.map( ( item, index ) => (
					<li
						key={ index }
						className={ classNames(
							'jetpack-cloud-sidebar__navigation-item',
							'jetpack-cloud-sidebar__navigation-item--highlighted'
						) }
					>
						{ item }
					</li>
				) ) }
			</ul>
		</div>
		{ footer && <div className="jetpack-cloud-sidebar__footer">{ footer }</div> }

		<SiteSelector
			showAddNewSite
			showAllSites={ isJetpackManage }
			isJetpackAgencyDashboard={ isJetpackManage }
			className="jetpack-cloud-sidebar__site-selector"
			allSitesPath="/dashboard"
			siteBasePath="/landing"
			wpcomSiteBasePath="https://wordpress.com/home"
		/>
	</nav>
);

export default Sidebar;
