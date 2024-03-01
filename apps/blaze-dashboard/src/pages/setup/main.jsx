import config from '@automattic/calypso-config';
import './style.scss';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import BlazePageViewTracker from 'calypso/my-sites/promote-post-i2/components/blaze-page-view-tracker';
import MainWrapper from 'calypso/my-sites/promote-post-i2/components/main-wrapper';
import PostsListBanner from 'calypso/my-sites/promote-post-i2/components/posts-list-banner';
import WooBanner from 'calypso/my-sites/promote-post-i2/components/woo-banner';
import { getAdvertisingDashboardPath } from 'calypso/my-sites/promote-post-i2/utils';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import GenericHeader from '../../components/generic-header';

export default function BlazeSetup() {
	const selectedSiteData = useSelector( getSelectedSite );
	const adminUrl = selectedSiteData?.options?.admin_url;

	const isWooBlaze = config.isEnabled( 'is_running_in_woo_site' );
	const translate = useTranslate();

	const headerTitle = isWooBlaze
		? translate( 'Blaze for WooCommerce' )
		: translate( 'Advertising' );

	return (
		<MainWrapper>
			<DocumentHead title={ headerTitle } />
			<BlazePageViewTracker
				path={ getAdvertisingDashboardPath( '/setup/:site' ) }
				title="Advertising > Setup"
			/>

			<div className="promote-post-i2__top-bar">
				<GenericHeader
					brandFont
					className="advertising__page-header advertising__page-header_has-banner"
					headerText={ headerTitle }
					align="left"
				/>
			</div>

			{ isWooBlaze ? <WooBanner /> : <PostsListBanner /> }

			<div className="promote-post-i2__aux-wrapper">
				<div className="empty-promotion-list__container promote-post-i2__setup-container">
					<h3 className="empty-promotion-list__title wp-brand-font">
						{ translate( 'Set up Blaze and start promoting your store' ) }
					</h3>
					<p className="empty-promotion-list__body">
						{ translate(
							"You're on the brink of unleashing the advertising potential of your store. To get started, follow these simple steps below:"
						) }
					</p>

					<ol className="promote-post-i2__active-steps">
						<li>
							{ translate( 'Go to the {{a}}traffic section{{/a}} of the Jetpack settings page.', {
								components: {
									a: (
										<a
											href={ `${ adminUrl }/admin.php?page=jetpack#/traffic` }
											target="_blank"
											rel="noreferrer"
										/>
									),
								},
							} ) }
						</li>
						<li>{ translate( 'Scroll down to the Blaze section and toggle it to active.' ) }</li>
					</ol>
					<p className="empty-promotion-list__body">
						{ translate(
							"After completing these steps, you're all set! Return here, refresh the page and start promoting your store with Blaze!"
						) }
					</p>
				</div>
			</div>
		</MainWrapper>
	);
}
