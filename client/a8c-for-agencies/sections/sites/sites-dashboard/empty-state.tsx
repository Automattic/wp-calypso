import { Button } from '@automattic/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function EmptyState() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = translate( 'Sites' );

	const pluginDownloadLink = ''; // FIXME: Provide correct download link.
	const resourceLink = ''; // FIXME: Provide correct resource link.

	return (
		<Layout title={ title } wide withBorder sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="sites-dashboard__empty">
					<A4ALogo className="sites-dashboard__empty-logo" size={ 64 } />

					<p className="sites-dashboard__empty-message">
						{ translate(
							'Add all of your sites to your dashboard by installing the Automattic for Agencies connection plugin. Once connected within wp-admin, your sites will automatically sync here.'
						) }
					</p>

					<div className="sites-dashboard__empty-actions">
						<Button
							href={ pluginDownloadLink }
							target="_blank"
							primary
							onClick={ () =>
								dispatch(
									recordTracksEvent( 'calypso_a4a_sites_dashboard_download_a4a_plugin_click' )
								)
							}
						>
							{ translate( 'Download A4A Plugin' ) }
						</Button>
						<Button
							href={ resourceLink }
							target="_blank"
							onClick={ () =>
								dispatch( recordTracksEvent( 'calypso_a4a_sites_dashboard_learn_more_click' ) )
							}
						>
							{ translate( 'Learn more' ) } <Icon icon={ external } size={ 18 } />
						</Button>
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
}
