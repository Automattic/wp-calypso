import { useLocalizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import globe from 'calypso/assets/images/domains/globe.svg';
import Banner from 'calypso/components/banner';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

const GoogleDomainOwnerBanner = () => {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const currentUser = useSelector( getCurrentUser );
	const targetUrl = localizeUrl( 'https://wordpress.com/transfer-google-domains/' );

	return (
		currentUser?.is_google_domain_owner && (
			<Banner
				className="google-domain-owner-banner"
				title={ translate( 'Reclaim your Google domains' ) }
				description={ translate(
					'Transfer your domains to WordPress.com now—we’ll lower our prices to match, and pay for an extra year'
				) }
				callToAction={ translate( 'Learn more' ) }
				disableCircle
				event="learn-more"
				iconPath={ globe }
				href={ targetUrl }
				tracksClickName="calypso_google_domain_owner_click"
				tracksImpressionName="calypso_google_domain_owner_impression"
				compactButton={ false }
				target="_blank"
			/>
		)
	);
};

export default GoogleDomainOwnerBanner;
