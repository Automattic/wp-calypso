import { isStarter } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import announcementImage from 'calypso/assets/images/marketplace/plugins-browser.svg';
import AnnouncementModal from 'calypso/blocks/announcement-modal';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite, getSitePlan } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const PluginsAnnouncementModal = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const jetpackNonAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);
	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId ) );

	if ( jetpackNonAtomic ) {
		// Buying plugins is not yet available to self hosted sites.
		return null;
	}

	if ( ! siteId || ! isStarter( sitePlan ) ) {
		return null;
	}

	const announcementPages = [
		{
			headline: translate( 'NEW' ),
			heading: translate( 'Install premium plugins on your site' ),
			content: translate(
				"You can now extend your site's capabilities with premium plugins. Available for purchase on the plugins page."
			),
			featureImage: announcementImage,
		},
	];

	return (
		<AnnouncementModal
			announcementId="plugins-page-starter-plan-launch"
			pages={ announcementPages }
			finishButtonText={ translate( 'Explore now' ) }
		/>
	);
};

export default PluginsAnnouncementModal;
