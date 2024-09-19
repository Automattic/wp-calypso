import config from '@automattic/calypso-config';
import './style.scss';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import BlazePageViewTracker from 'calypso/my-sites/promote-post-i2/components/blaze-page-view-tracker';
import MainWrapper from 'calypso/my-sites/promote-post-i2/components/main-wrapper';
import { getAdvertisingDashboardPath } from 'calypso/my-sites/promote-post-i2/utils';
import GenericHeader from '../../components/generic-header';
import BlazeDisabled from './components/blaze-disabled';
import DisconnectedSite from './components/disconnected-site';
import IneligibleSite from './components/ineligible-site';
import PrivateSite from './components/private-site';

const renderSetupComponent = ( setupInfo ) => {
	// Compatibility with previous Jetpack's version
	const reason = typeof setupInfo === 'boolean' ? 'blaze_disabled' : setupInfo;

	switch ( reason ) {
		case 'blaze_disabled':
			return <BlazeDisabled />;
		case 'site_private_or_coming_soon':
			return <PrivateSite />;
		case 'disconnected':
			return <DisconnectedSite />;
		case 'site_ineligible':
			return <IneligibleSite />;
		default:
			return <BlazeDisabled />;
	}
};

export default function BlazeSetup( { setupInfo } ) {
	const isBlazePlugin = config.isEnabled( 'is_running_in_blaze_plugin' );
	const translate = useTranslate();

	const headerTitle = isBlazePlugin ? translate( 'Blaze Ads' ) : translate( 'Advertising' );

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

			<div className="promote-post-i2__outer-wrapper">
				<div className="promote-post-i2__aux-wrapper">
					<div className="empty-promotion-list__container promote-post-i2__setup-container">
						{ renderSetupComponent( setupInfo ) }
					</div>
				</div>
			</div>
		</MainWrapper>
	);
}
