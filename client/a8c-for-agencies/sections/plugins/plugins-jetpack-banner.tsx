import { JetpackLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Banner from 'calypso/components/banner';

export default function A4APluginsJetpackBanner() {
	const translate = useTranslate();

	return (
		<div className="a4a-plugins-jetpack-banner-container">
			<Banner
				title={ translate( 'Jetpack Required for Plugin Management' ) }
				description={ translate(
					'To manage plugins, Jetpack must be activated on each site. Your Pressable plan includes Jetpack Complete for free. Activate it to access plugin management in this dashboard.'
				) }
				icon={ <JetpackLogo size={ 16 } /> }
				className="plugins__jetpack-banner"
				dismissPreferenceName="a4a-plugins-jetpack-banner"
				disableCircle
				jetpack
			/>
		</div>
	);
}
