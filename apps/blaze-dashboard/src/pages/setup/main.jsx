import config from '@automattic/calypso-config';
import './style.scss';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import BlazePageViewTracker from 'calypso/my-sites/promote-post-i2/components/blaze-page-view-tracker';
import MainWrapper from 'calypso/my-sites/promote-post-i2/components/main-wrapper';
// import PostsListBanner from 'calypso/my-sites/promote-post-i2/components/posts-list-banner';
// import WooBanner from 'calypso/my-sites/promote-post-i2/components/woo-banner';
import { getAdvertisingDashboardPath } from 'calypso/my-sites/promote-post-i2/utils';
import GenericHeader from '../../components/generic-header';
import BlazeDisabled from './components/blaze-disabled';

const renderSetupComponent = ( setupInfo ) => {
	// Compatibility with previous Jetpack's version
	const reason = typeof setupInfo === 'boolean' ? 'blaze_disabled' : setupInfo;

	switch ( reason ) {
		case 'blaze_disabled':
		default:
			return <BlazeDisabled />;
	}
};

export default function BlazeSetup( { setupInfo } ) {
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

			{ /* todo i think in setupages we never show the banner.. but not deleting as i am not sure */ }
			{ /*{ isWooBlaze ? <WooBanner /> : <PostsListBanner /> }*/ }

			<div className="promote-post-i2__aux-wrapper">
				<div className="empty-promotion-list__container promote-post-i2__setup-container">
					{ renderSetupComponent( setupInfo ) }
				</div>
			</div>
		</MainWrapper>
	);
}
