import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import announcementImage from 'calypso/assets/images/marketplace/plugins-browser.svg';
import AnnouncementModal from 'calypso/blocks/announcement-modal';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const PluginsAnnouncementModal = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const selectedSiteUrl = useSelector( getSelectedSiteSlug );
	const jetpackNonAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);

	if ( jetpackNonAtomic ) {
		// Buying plugins is not yet available to self hosted sites.
		return null;
	}

	if ( ! selectedSiteUrl ) {
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
			ctaLink: `/plugins/${ selectedSiteUrl }`,
		},
	];

	return (
		<AnnouncementModal
			announcementId="plugins-page-starter-plan-launch2"
			pages={ announcementPages }
			finishButtonText={ translate( 'Explore now' ) }
		/>
	);
};

export default PluginsAnnouncementModal;
