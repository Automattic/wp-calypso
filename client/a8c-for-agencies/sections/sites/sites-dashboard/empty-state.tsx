import { Button } from '@automattic/components';
import { Icon, plugins } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_DOWNLOAD_LINK_ON_GITHUB,
	JETPACK_CONNECT_A4A_LINK,
} from 'calypso/a8c-for-agencies/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function EmptyState() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = translate( 'Sites' );

	return (
		<Layout title={ title } wide withBorder sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="sites-dashboard-empty">
					<h1 className="sites-dashboard-empty__heading">
						{ translate( 'Connect your sites and simplify your work' ) }
					</h1>

					<p className="sites-dashboard-empty__subheading">
						{ translate( "Manage all your sites's products from one place." ) }
					</p>
					<div className="sites-dashboard-empty__body">
						<div className="sites-dashboard-empty__plugins-icon">
							<Icon
								className="sidebar__menu-icon"
								style={ { fill: 'currentcolor' } }
								icon={ plugins }
								size={ 24 }
							/>
						</div>
						<div className="sites-dashboard-empty__content">
							<div className="sites-dashboard-empty__content-heading">
								{ translate( 'Install the A4A plugin to manage your sites in the dashboard' ) }
							</div>
							<p className="sites-dashboard-empty__content-description">
								{ translate(
									"Use the A4A plugin to actively connect your clients' sites to Automattic for Agencies — it's lightweight and efficient, working seamlessly in the background."
								) }
							</p>
							<p className="sites-dashboard-empty__content-description">
								{ translate(
									'Already have Jetpack installed? You can use it as a connection option as well.'
								) }
							</p>

							<div className="sites-dashboard-empty__content-button">
								<Button
									href={ A4A_DOWNLOAD_LINK_ON_GITHUB }
									target="_blank"
									primary
									onClick={ () =>
										dispatch(
											recordTracksEvent( 'calypso_a4a_sites_dashboard_download_a4a_plugin_click' )
										)
									}
								>
									{ translate( 'Download the A4A client plugin' ) }
								</Button>
								<Button
									href={ JETPACK_CONNECT_A4A_LINK }
									target="_blank"
									onClick={ () =>
										dispatch(
											recordTracksEvent( 'calypso_a4a_sites_dashboard_connect_jetpack_click' )
										)
									}
								>
									{ translate( 'Connect a site via Jetpack' ) }
								</Button>
							</div>
						</div>
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
}
