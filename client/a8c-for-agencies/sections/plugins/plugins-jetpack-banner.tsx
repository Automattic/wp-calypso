import { JetpackLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import Banner from 'calypso/components/banner';
import { useSelector } from 'calypso/state';
import { getPreference } from 'calypso/state/preferences/selectors';

const JETPACK_BANNER_DISMISS_PREFERENCE = 'a4a-plugins-jetpack-banner';

export default function A4APluginsJetpackBanner() {
	const translate = useTranslate();
	const pressableOwnership = usePressableOwnershipType();
	const isDismissed = useSelector( ( state ) =>
		getPreference( state, 'dismissible-card-' + JETPACK_BANNER_DISMISS_PREFERENCE )
	);

	if ( isDismissed ) {
		return null;
	}

	// Only Pressable plans bought through A4A include Jetpack Complete for free.
	const description =
		pressableOwnership === 'agency'
			? translate(
					'To manage plugins, Jetpack must be activated on each site. Your Pressable plan includes Jetpack Complete for free. Activate it to access plugin management in this dashboard.'
				)
			: translate(
					'To manage plugins, Jetpack must be activated on each site. Activate Jetpack to access plugin management in this dashboard.'
				);

	return (
		<div className="a4a-plugins-jetpack-banner-container">
			<Banner
				title={ translate( 'Jetpack required for plugin management' ) }
				description={ description }
				icon={ <JetpackLogo size={ 16 } /> }
				className="plugins__jetpack-banner"
				dismissPreferenceName={ JETPACK_BANNER_DISMISS_PREFERENCE }
				disableCircle
				jetpack
			/>
		</div>
	);
}
