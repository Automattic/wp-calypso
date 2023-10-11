import config from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import SiteSelector from 'calypso/components/site-selector';
import { useDispatch } from 'calypso/state';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

import './style.scss';

// This is meant to be the "base" sidebar component. All context-specific sidebars
// (Sites Management, Plugin Management, Purchases, non-Manage functionality)
// would use it to construct the right experience for that context.

type Props = {
	className?: string;
	path: string;
};
const Sidebar = ( { className, path }: Props ) => {
	const isAtomicSiteCreationEnabled = config.isEnabled(
		'jetpack/pro-dashboard-wpcom-atomic-hosting'
	);

	const dispatch = useDispatch();

	const onSwitchSite = () => {
		dispatch( setLayoutFocus( 'sites' ) );
	};

	return (
		<>
			<nav className={ classNames( 'jetpack-cloud-sidebar', className ) }>
				<header className="jetpack-cloud-sidebar__header">
					Header
					<Button onClick={ onSwitchSite }>Switch Site</Button>
				</header>
				<div className="jetpack-cloud-sidebar__main">
					<ul role="menu" className="jetpack-cloud-sidebar__navigation-list">
						<li
							className={ classNames(
								'jetpack-cloud-sidebar__navigation-item',
								'jetpack-cloud-sidebar__navigation-item--highlighted'
							) }
						>
							Navigation items
						</li>
						<li className="jetpack-cloud-sidebar__navigation-item">Will go here</li>
					</ul>
				</div>
				<div className="jetpack-cloud-sidebar__footer">Footer</div>
			</nav>

			<SiteSelector
				showAddNewSite
				showAllSites
				isJetpackAgencyDashboard={ isAtomicSiteCreationEnabled }
				className="jetpack-cloud-sidebar__site-selector"
				allSitesPath={ path }
				siteBasePath="/backup"
				wpcomSiteBasePath={ isAtomicSiteCreationEnabled && 'https://wordpress.com/home' }
			/>
		</>
	);
};

export default Sidebar;
